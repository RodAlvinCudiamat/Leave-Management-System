import { pool } from './db.js';
import { eachDayOfInterval, isWeekend } from 'date-fns';
import { APPLICATION_STATUS } from '../config/constants.js';

/**
 * @class ApplicationDays
 * Leave application days model for managing days within a leave application.
 */
class ApplicationDays {
    /**
     * Insert leave days for a given application.
     * Generates days between start_date and end_date, marks holidays and workdays.
     * 
     * @static
     * @async
     * @method insertApplicationDays
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} conn - Database connection or pool.
     * @param {number} application_id - Leave application ID
     * @param {string} start_date - Start date (YYYY-MM-DD)
     * @param {string} end_date - End date (YYYY-MM-DD)
     * @param {string[]} holidays - List of holiday dates (YYYY-MM-DD)
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async insertApplicationDays(application_id, start_date, end_date, holidays, conn) {
        const response_data = { status: false, result: null, error: null };

        try {
            /* Generate all dates in the range */
            const days = eachDayOfInterval({ start: new Date(start_date), end: new Date(end_date) });
            const values = [];
            const inserted_days = [];

            /* Prepare values for bulk insert */
            days.forEach(day => {
                const date_str = day.toISOString().split("T")[0];
                const is_holiday = holidays.includes(date_str);
                const is_workday = !isWeekend(day) && !is_holiday;

                /* Push values for insertion */
                values.push([
                    application_id,
                    APPLICATION_STATUS.SUBMITTED,
                    null,
                    1,
                    is_workday,
                    is_holiday,
                    date_str,
                    null,
                    new Date(),
                    new Date()
                ]);

                inserted_days.push({ date: date_str, is_workday, is_holiday });
            });
            
            /* Bulk insert all days */
            if (values.length > 0) {
                const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
                const flat_values = values.flat();

                const [result] = await conn.query(`
                    INSERT INTO leave_application_days
                        (leave_application_id, leave_application_status_id, approver_employee_id, day_in_fraction, is_workday, is_holiday, date, approved_at, created_at, updated_at)
                    VALUES ${placeholders}
                `, flat_values);

                /* Assign generated IDs to each inserted day */
                inserted_days.forEach((day, index) => {
                    day.id = result.insertId + index;
                });
            }

            response_data.status = true;
            response_data.result = inserted_days;
        } 
        catch (error) {
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch all leave application days for a specific application.
     * Includes employee name, leave type, status, and day details.
     * 
     * @static
     * @async
     * @method fetchLeaveApplicationDays
     * @param {number} application_id - Leave application ID
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchLeaveApplicationDays(application_id = null){
        const response_data = { status: false, result: null, error: null };

        try{
            const params = [];
            if(application_id){
                params.push(application_id);
            }

            let leave_application_days_query = `
                SELECT leave_days.id,
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    leave_types.name,
                    status.name,
                    leave_days.date,
                    leave_days.day_in_fraction,
                    leave_days.is_workday,
                    leave_days.is_holiday
                FROM leave_application_days AS leave_days
                LEFT JOIN leave_applications AS application ON leave_days.leave_application_id = application.id
                LEFT JOIN employees AS employee ON application.employee_id = employee.id
                LEFT JOIN leave_types ON application.leave_type_id = leave_types.id 
                LEFT JOIN leave_application_statuses AS status ON leave_days.leave_application_status_id = status.id
                ${application_id ? 'WHERE leave_days.leave_application_id = ?' : ''}
                ORDER BY leave_days.date ASC
            `;

            const [leave_application_days] = await pool.query(leave_application_days_query, params);

            if(leave_application_days.length){
                response_data.status = true;
                response_data.result = leave_application_days;
            }
            else{
                response_data.error = 'No leave application days found';
            }
        } 
        catch(error){
            /* Return any error encountered */
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Update the status of a specific leave application day.
     * Sets approver and approval timestamp if status is approved.
     * 
     * @static
     * @async
     * @method updateApplicationDayStatus
     * @param {number} day_id - Leave application day ID
     * @param {number} status_id - Leave application status ID
     * @param {number} approver_id - Employee ID of approver
     * @returns {Promise<{status: boolean, result: string|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateApplicationDayStatus(ids, status_id, approver_id, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try {
            if(!Array.isArray(ids) || ids.length === 0){
                response_data.error = "No day IDs provided";
            }
            const [update_status] = await conn.query(`
                UPDATE leave_application_days
                SET leave_application_status_id = ?,
                    approver_employee_id = ?,
                    approved_at = (CASE WHEN ? = ? THEN NOW() ELSE NULL END),
                    updated_at = NOW()
                WHERE id IN (?)
                `, [status_id, approver_id, status_id, APPLICATION_STATUS.APPROVED, ids]
            );

            if(update_status.affectedRows > 0){
                response_data.status = true;

                if(update_status.changedRows > 0){
                    response_data.result = `Updated ${update_status.changedRows} of ${update_status.affectedRows} day(s) [${ids.join(", ")}] to status ${status_id}`;
                } 
                else{
                    response_data.result = `Day(s) [${ids.join(", ")}] already had status ${status_id}`;
                }
            }
            else{
                response_data.error = `No days found with IDs [${ids.join(", ")}]`;
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch a leave application day by its ID.
     * 
     * @static
     * @async
     * @method fetchDayWithApplication
     * @param {number} day_id - Leave application day ID
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchDayWithApplication(ids, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try {
            const [fetch_applied_days] = await conn.query(`
                SELECT application_days.id AS day_id,
                        application_days.date,
                        application_days.day_in_fraction,
                        application_days.leave_application_status_id,
                        application.id AS application_id,
                        application.employee_id,
                        application.leave_type_id,
                        employee.first_name,
                        employee.last_name,
                        leave_type.name,
                        leave_type.leave_type_time_unit_id,
                        time_unit.name AS time_unit_name
                FROM leave_application_days AS application_days
                LEFT JOIN leave_applications AS application ON application.id = application_days.leave_application_id
                LEFT JOIN employees AS employee ON employee.id = application.employee_id
                LEFT JOIN leave_types AS leave_type ON leave_type.id = application.leave_type_id
                LEFT JOIN leave_type_time_units AS time_unit ON time_unit.id = leave_type.leave_type_time_unit_id
                WHERE application_days.id IN (?)
                LIMIT 1
                `, [ids]
            );

            if(fetch_applied_days.length){
                response_data.status = true;
                response_data.result = fetch_applied_days;
            } 
            else{
                response_data.error = `No day found with id ${ids}`;
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default ApplicationDays;
import { pool } from './db.js';
import { eachDayOfInterval, isWeekend } from 'date-fns';
import { APPLICATION_STATUS } from '../config/constants.js';

/**
 * @class ApplicationDays
 * Leave application days model for managing days within a leave application.
 */
class ApplicationDays {
    /**
     * Constructor for the ApplicationDays class.
     *
     * @constructor
     * @param {number|null} id - The unique ID of the leave application day (null for new records).
     * @param {number} leave_application_id - The ID of the related leave application.
     * @param {number} leave_application_status_id - The status ID of the leave application day.
     * @param {number|null} approver_employee_id - The ID of the employee who approved the day (null if not yet approved).
     * @param {number} day_in_fraction - Fraction of the day taken (e.g., 1 for full day, 0.5 for half day).
     * @param {boolean} is_workday - Whether the day is a workday.
     * @param {boolean} is_holiday - Whether the day is a holiday.
     * @param {string|Date} date - The date of the leave day.
     * @param {string|Date|null} approved_at - The date and time when the day was approved (null if not yet approved).
     */
    constructor(id, leave_application_id, leave_application_status_id, approver_employee_id, day_in_fraction, is_workday, is_holiday, date, approved_at) {
        this.id = id;
        this.leave_application_id = leave_application_id;
        this.leave_application_status_id = leave_application_status_id;
        this.approver_employee_id = approver_employee_id;
        this.day_in_fraction = day_in_fraction;
        this.is_workday = is_workday;
        this.is_holiday = is_holiday;
        this.date = date;
        this.approved_at = approved_at;
    }

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
    static async insertApplicationDays(conn, application_id, start_date, end_date, holidays){
        const response_data = { status: false, result: null, error: null };

        try {
            const days = eachDayOfInterval({ start: new Date(start_date), end: new Date(end_date) });
            const inserted_days = [];

            /* Mark holidays and workdays */
            for(const day of days){
                const date_str = day.toISOString().split("T")[0];
                const is_holiday = holidays.includes(date_str);
                const is_workday = !isWeekend(day) && !is_holiday;

                const [result] = await conn.query(`
                    INSERT INTO leave_application_days
                        (leave_application_id, leave_application_status_id, approver_employee_id, day_in_fraction, is_workday, is_holiday, date, approved_at, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [application_id, APPLICATION_STATUS.SUBMITTED, null,  1, is_workday, is_holiday, date_str, null]
                );

                inserted_days.push({ id: result.insertId, date: date_str, is_workday, is_holiday });
            }

            response_data.status = true;
            response_data.result = inserted_days;
        }
        catch(error){
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
    static async fetchLeaveApplicationDays(application_id){
        const response_data = { status: false, result: null, error: null };

        try{
            /* Query leave days joined with employee and leave type */
            const [leave_application_days] = await pool.query(`
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
                WHERE leave_days.leave_application_id = ?
                ORDER BY leave_days.date ASC
                `, [application_id]);

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
     * Fetch all leave application days in the system.
     * Includes employee name, leave type, and day details.
     * 
     * @static
     * @async
     * @method fetchAllLeaveApplicationDays
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */

    static async fetchAllLeaveApplicationDays(){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_application_days] = await pool.query(`
                SELECT leave_days.id,
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    leave_types.leave_type,
                    leave_days.date_of_leave,
                    leave_days.day_in_fraction,
                    leave_days.is_workday,
                    leave_days.is_holiday
                FROM leave_application_days AS leave_days
                LEFT JOIN leave_applications AS application ON leave_days.leave_application_id = application.id
                LEFT JOIN employees AS employee ON application.employee_id = employee.id
                LEFT JOIN leave_types ON application.leave_type_id = leave_types.id 
                ORDER BY leave_days.date_of_leave ASC
                `);

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
    static async updateApplicationDayStatus(day_id, status_id, approver_id, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try {
            const [result] = await conn.query(`
                UPDATE leave_application_days
                SET leave_application_status_id = ?,
                    approver_employee_id = ?,
                    approved_at = (CASE WHEN ? = ? THEN NOW() ELSE NULL END),
                    updated_at = NOW()
                WHERE id = ?
                `, [status_id, approver_id, status_id, APPLICATION_STATUS.APPROVED, day_id]
            );

            if(result.affectedRows){
                if(result.changedRows){
                    response_data.status = true;
                    response_data.result = `Day ${day_id} updated to status ${status_id}`;
                } 
                else{
                    response_data.status = true;
                    response_data.result = `Day ${day_id} already has status ${status_id}`;
                }
            } 
            else{
                response_data.error = `No day found with id ${day_id}`;
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
     static async fetchDayWithApplication(day_id, conn = pool) {
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
                        e.first_name,
                        e.last_name,
                        lt.name
                FROM leave_application_days AS application_days
                LEFT JOIN leave_applications AS application ON application.id = application_days.leave_application_id
                LEFT JOIN employees AS e ON e.id = application.employee_id
                LEFT JOIN leave_types AS lt ON lt.id = application.leave_type_id
                WHERE application_days.id = ?
                LIMIT 1
                `, [day_id]
            );

            if(fetch_applied_days.length){
                response_data.status = true;
                response_data.result = fetch_applied_days[0];
            } 
            else{
                response_data.error = `No day found with id ${day_id}`;
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }


}

export default ApplicationDays;
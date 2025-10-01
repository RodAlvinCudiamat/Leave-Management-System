import { pool } from './db.js';
import ApplicationDays from './LeaveApplicationDay.js';
import Holiday from './Holiday.js';
import { IS_PENDING } from '../config/constants.js';

/**
 * @class LeaveApplication
 * LeaveApplication model for managing employee leave applications.
 */
class LeaveApplication {
    /**
     * Insert a new leave application along with its application days.
     *
     * @static
     * @async
     * @method insertLeaveApplication
     * @param {object} param - Object containing employee_id, leave_type_id, start_date, end_date, and reason.
     * @param {number} employee_id - Employee ID.
     * @param {number} leave_type_id - Leave type ID.
     * @param {string} start_date - Start date (YYYY-MM-DD).
     * @param {string} end_date - End date (YYYY-MM-DD).
     * @param {string} reason - Reason for leave application.
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} conn - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 28, 2025
     */
    static async insertLeaveApplication({employee_id, leave_type_id, start_date, end_date, reason, conn = pool}) {
        const response_data = { status: false, result: null, error: null };

        const connection = await conn.getConnection();
        await connection.beginTransaction();

        try{
            /* Insert into leave_applications */
            const [insert_app] = await connection.query(`
                INSERT INTO leave_applications
                    (employee_id, leave_type_id, is_pending, start_date, end_date, reason, filed_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
            `, [employee_id, leave_type_id, IS_PENDING.TRUE, start_date, end_date, reason]);

            const application_id = insert_app.insertId;

            /* Fetch holidays in the range */
            const holidays_resp = await Holiday.fetchHolidays(start_date, end_date);
            const holidays = holidays_resp.status ? holidays_resp.result : [];

            /* Generate application days */
            const insert_days = await ApplicationDays.insertApplicationDays(
                application_id, start_date, end_date, holidays, connection
            );

            if(insert_days.error){
                throw new Error(insert_days.error);
            }

            await connection.commit();

            response_data.status = true;
            response_data.result = { id: application_id, days: insert_days.result };
        } 
        catch(err){
            await connection.rollback();
            response_data.error = err.message;
        } 
        finally{
            connection.release();
        }

        return response_data;
    }

    /**
     * Fetch a leave application by its ID.
     * 
     * @static
     * @async
     * @method fetchLeaveApplicationById
     * @param {number} id - Leave application ID
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} conn - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchLeaveApplicationById(id, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_application] = await conn.query(`
                SELECT application.id AS application_id,
                    application.employee_id,     
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    leave_types.id AS leave_type_id,
                    department.name,
                    leave_types.name,
                    application.reason,
                    application.start_date,
                    application.end_date,
                    application.filed_at
                FROM leave_applications as application
                LEFT JOIN employees AS employee ON application.employee_id = employee.id
                LEFT JOIN employee_departments AS department ON employee.employee_department_id = department.id
                LEFT JOIN leave_types ON application.leave_type_id = leave_types.id
                WHERE application.id = ?
                ORDER BY application.filed_at DESC
                LIMIT 1`, 
            [id]);

            if(leave_application.length){
                response_data.status = true;
                response_data.result = leave_application[0];
            } 
            else{
                response_data.error = "No leave applications found";
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Fetch all leave applications in the system.
     * 
     * @static
     * @async
     * @method fetchAllLeaveApplications
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllLeaveApplications( employee_id = null ){
        const response_data = { status: false, result: null, error: null };

        try{
            const params = [];
            
            if(employee_id){
                params.push(employee_id);
            }

            let leave_applications_query = `
                SELECT application.id AS application_id,
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    department.name AS deptname,
                    leave_types.name,
                    application.is_pending,
                    application.reason,
                    application.start_date,
                    application.end_date,
                    application.filed_at
                FROM leave_applications AS application
                LEFT JOIN employees AS employee ON application.employee_id = employee.id
                LEFT JOIN employee_departments AS department ON employee.employee_department_id = department.id
                LEFT JOIN leave_types ON application.leave_type_id = leave_types.id
                ${employee_id ? 'WHERE application.employee_id = ?' : ''}
                ORDER BY application.filed_at DESC
            `;

            const [leave_applications] = await pool.query(leave_applications_query, params);

            if(leave_applications.length){
                response_data.status = true;
                response_data.result = leave_applications;
            }
            else{
                response_data.error = "No leave applications found";
            }
        }
        catch(error){
            /* Return any error encountered */
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Check for overlapping leave applications for an employee.
     * 
     * @static
     * @async
     * @method hasOverlappingLeave
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @param {string} start_date - Start date (YYYY-MM-DD)
     * @param {string} end_date - End date (YYYY-MM-DD)
     * @returns {Promise<{status: boolean, result: number|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async hasOverlappingLeave( employee_id, leave_type_id, start_date, end_date){
        const response_data = { status: false, result: null, error: null };

        try{
            /* Doesn't return any specific data from the table, if 1 is returned, then there is overlap */
            const [fetch_overlapping_days] = await pool.query(`
                SELECT application.id
                FROM leave_applications AS application
                WHERE application.employee_id = ?
                AND application.leave_type_id = ?
                AND application.start_date <= ?
                AND application.end_date   >= ?
                AND application.is_pending = ?
                LIMIT 1;
                `, [employee_id, leave_type_id, end_date, start_date , IS_PENDING.TRUE] 
            );

            response_data.status = true;
            response_data.result = fetch_overlapping_days.length
            ? fetch_overlapping_days[0].id : null; /* true if overlap found */
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    };

    /**
     * Update the status of a leave application to not pending (approved/denied).
     * 
     * @static
     * @async
     * @method updateLeaveApplicationStatus
     * @param {number} application_id - Leave application ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateLeaveApplicationStatus(application_id){
        const response_data = { status: false, result: null, error: null };

        try{
            const [update_status] = await pool.query(`
                UPDATE leave_applications
                SET is_pending = ?
                WHERE id = ? 
                LIMIT 1
                `, [IS_PENDING.FALSE, application_id]
            );

            response_data.status = true;
            response_data.result = update_status;
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    }
}

export default LeaveApplication;







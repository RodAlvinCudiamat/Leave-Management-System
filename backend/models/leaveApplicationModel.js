import { pool } from './db.js';
import ApplicationDays from './leaveApplicationDayModel.js';
import Holiday from './holidayModel.js';
import { IS_PENDING } from '../config/constants.js';

/**
 * @class LeaveApplication
 * LeaveApplication model for managing employee leave applications.
 */
class LeaveApplication {
    /**
     * Constructor for the LeaveApplication class.
     *
     * @constructor
     * @param {number|null} id - The unique ID of the leave application (null for new records).
     * @param {number} employee_id - The ID of the employee applying for leave.
     * @param {number} leave_type_id - The ID of the leave type.
     * @param {string} start_date - The start date of the leave application (YYYY-MM-DD).
     * @param {string} end_date - The end date of the leave application (YYYY-MM-DD).
     * @param {string} reason - The reason for the leave application.
     * @param {string} status - The status of the leave application.
     */
    constructor(id, employee_id, leave_type_id, start_date, end_date, reason, status) {
        this.id = id;
        this.employee_id = employee_id;
        this.leave_type_id = leave_type_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.reason = reason;
        this.status = status;
    }

    /**
     * Insert a new leave application.
     * Also generates leave application days between start_date and end_date,
     * marking holidays and workdays accordingly.
     * 
     * @async
     * @method insert
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    async insert(){
        const response_data = { status: false, result: null, error: null };

        /* Start transaction */
        const conn = await pool.getConnection();
        await conn.beginTransaction();

        try{
            /* Insert into leave_applications */
            const [insert_app] = await conn.query(`
                INSERT INTO leave_applications
                    (employee_id, leave_type_id, is_pending, start_date, end_date, reason, filed_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
                `, [this.employee_id, this.leave_type_id, IS_PENDING.TRUE, this.start_date, this.end_date, this.reason]
            );

            const application_id = insert_app.insertId;

            /* Fetch holidays in the range */
            const holidays_resp = await Holiday.fetchHolidays(this.start_date, this.end_date);
            const holidays = holidays_resp.status ? holidays_resp.result : [];


            /* Generate days between start_date and end_date */
            const insert_days = await ApplicationDays.insertApplicationDays(conn, application_id, this.start_date, this.end_date, holidays);
            if(insert_days.error){
                throw new Error(insert_days.error); 
            }
            else{
                await conn.commit(); 
                response_data.status = true;
                response_data.result = { id: application_id, days: insert_days.result };
            }
        } 
        catch(err){
            await conn.rollback(); 
            response_data.error = err.message;
        }

        finally{
            conn.release(); 
        }

        return response_data;
    };

    /**
     * Static factory for inserting leave application.
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
     * @lastupdated September 26, 2025
     */
    static async insertLeaveApplication( {employee_id, leave_type_id, start_date, end_date, reason}, conn = pool) {
        const application = new LeaveApplication(null, employee_id, leave_type_id, start_date, end_date, reason);
        return await application.insert( conn ) ;
    };

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
     * Fetch all leave applications for a specific employee.
     * 
     * @static
     * @async
     * @method fetchLeaveApplicationByEmployeeId
     * @param {number} employee_id - Employee ID
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchLeaveApplicationByEmployeeId(employee_id){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_applications] = await pool.query(`
                SELECT application.id AS application_id,
                    leave_types.name,
                    application.reason,
                    application.is_pending AS status,
                    application.start_date,
                    application.end_date,
                    application.filed_at
                FROM leave_applications AS application
                LEFT JOIN leave_types ON application.leave_type_id = leave_types.id
                WHERE application.employee_id = ?
                ORDER BY application.filed_at DESC`,
                [employee_id]
            );

            if(leave_applications.length){
                response_data.status = true;
                response_data.result = leave_applications;
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
    static async fetchAllLeaveApplications() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_applications] = await pool.query(`
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
                ORDER BY application.id DESC`
            );

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
            const [fetch_overlapping_days] = await pool.query(`
                SELECT 1
                FROM leave_applications AS la
                WHERE la.employee_id = ?
                AND la.leave_type_id = ?
                AND la.start_date <= ?
                AND la.end_date   >= ?
                LIMIT 1;
                `, [employee_id, leave_type_id, end_date, start_date] 
            );

            response_data.status = true;
            response_data.result = fetch_overlapping_days.length; /* true if overlap found */
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
                SET is_pending = 0
                WHERE id = ? 
                LIMIT 1
                `, [application_id]
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







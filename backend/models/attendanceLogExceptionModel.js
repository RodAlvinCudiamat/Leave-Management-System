import { pool } from "./db.js";

/**
 * @class AttendanceLogException
 * Represents an exception entry for attendance logs (e.g., overtime, undertime).
 */
class AttendanceLogException {
    /**
     * Creates a new AttendanceLogException instance.
     * 
     * @constructor
     * @param {number|null} id - The unique ID of the log exception (null for new records).
     * @param {number} attendance_log_id - The ID of the related attendance log.
     * @param {number} hours - Number of hours for the exception (e.g., overtime hours).
     * @param {boolean} is_overtime - Whether the exception is overtime (`true`) or undertime (`false`).
     * @param {string|Date} valid_until_at - Expiration date for the exception.
     */
    constructor(id, attendance_log_id, hours, is_overtime, valid_until_at) {
        this.id = id;
        this.attendance_log_id =  attendance_log_id;
        this.hours = hours;
        this.is_overtime = is_overtime;
        this.valid_until_at = valid_until_at;
    }

    /**
     * Inserts a new attendance log exception record into the database.
     * 
     * @async
     * @method insert
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    async insert(conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try{
            const [insert_log_exception] = await conn.query(`
                INSERT INTO attendance_log_exceptions
                    (attendance_log_id, hours, is_overtime, valid_until_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [this.attendance_log_id, this.hours, this.is_overtime, this.valid_until_at]
            );

            if(insert_log_exception.affectedRows){
                response_data.status = true;
                response_data.result = { log_exception_id: insert_log_exception.insertId };
                this.id = insert_log_exception.insertId;
            } 
            else{
                response_data.error = 'Failed to insert log exception';
            }
        } 
        catch(err) {
            response_data.error = err.message;
        }

        return response_data;
    }

    /**
     * Static method to create and insert a new attendance log exception in one call.
     * 
     * @static
     * @async
     * @method insertLogException
     * @param {number} attendance_log_id - ID of the related attendance log.
     * @param {number} hours - Number of hours for the exception.
     * @param {boolean} is_overtime - Whether the exception is overtime (`true`) or undertime (`false`).
     * @param {string|Date} valid_until_at - Expiration date for the exception.
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async insertLogException(attendance_log_id, hours, is_overtime, valid_until_at, conn = pool) {
        const log_exception = new AttendanceLogException(null, attendance_log_id, hours, is_overtime, valid_until_at);
        return await log_exception.insert(conn);
    }

    /**
     * Retrieves all attendance log exceptions from the database.
     * 
     * @static
     * @async
     * @method fetchLogExceptions
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async fetchLogExceptions(){
        const response_data = { status: false, result: null, error: null };

        try{
            const [log_exceptions] = await pool.query(`
                SELECT log_exception.id,
                       log_exception.attendance_log_id, 
                       attendance_logs.date,
                       employees.first_name,
                       employees.last_name,
                       log_exception.hours, 
                       log_exception.is_overtime, 
                       log_exception.valid_until_at
                FROM attendance_log_exceptions AS log_exception
                LEFT JOIN attendance_logs ON log_exception.attendance_log_id = attendance_logs.id
                LEFT JOIN employees ON attendance_logs.employee_id = employees.id
                ORDER BY valid_until_at ASC
            `);

            if(log_exceptions.length){
                response_data.status = true;
                response_data.result = log_exceptions;
            } 
            else{
                response_data.error = 'No log exceptions found';
            }
        } 
        catch(err) {
            response_data.error = err.message;
        }

        return response_data;
    }
    /**
     * Updates an existing attendance log exception by ID.
     * 
     * @static
     * @async
     * @method updateLogExceptionById
     * @param {number} id - ID of the log exception to update.
     * @param {object} data - Fields to update (e.g., `{ hours: 2, valid_until_at: '2025-12-31' }`).
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async updateLogExceptionById(id, data, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try{
            const fields = [];
            const values = [];

            /* Build dynamic update query based on provided fields */
            for(const key in data){
                if(data[key] !== undefined && data[key] !== null && data[key] !== "") {
                    fields.push(`\`${key}\` = ?`);
                    values.push(data[key]);
                }
            }

            if(fields.length){
                response_data.error = "No fields to update";
                return response_data;
            }
            else{
                values.push(id);

                /* Add id as last parameter for WHERE */
                const update_query = `
                    UPDATE attendance_log_exceptions
                    SET ${fields.join(", ")}
                    WHERE id = ?
                `;

                const [update_log_exception] = await conn.query(update_query, values);

                if(update_log_exception.affectedRows){
                    response_data.status = true;
                    response_data.result = { log_exception_id: id };
                } 
                else{
                    response_data.error = 'Failed to update log exception';
                }
            }
        }
        catch(err) {
            response_data.error = err.message;
        }

        return response_data;
    }
}

export default AttendanceLogException;
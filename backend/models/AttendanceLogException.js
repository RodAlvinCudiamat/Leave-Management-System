import { pool } from "./db.js";

/**
 * @class AttendanceLogException
 * Represents an exception entry for attendance logs (e.g., overtime, undertime).
 */
class AttendanceLogException {
    
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
     * @lastupdated September 28, 2025
     */
    static async insertLogException(attendance_log_id, hours, is_overtime, valid_until_at, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try{
            const [insert_log_exception] = await conn.query(`
                INSERT INTO attendance_log_exceptions 
                    (attendance_log_id, hours, is_overtime, valid_until_at, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
                `, [attendance_log_id, hours, is_overtime, valid_until_at]
            );

            if(insert_log_exception.affectedRows){
                response_data.status = true;
                response_data.result = { log_exception_id: insert_log_exception.insertId };
            } 
            else{
                response_data.error = "Failed to insert log exception.";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
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
}

export default AttendanceLogException;
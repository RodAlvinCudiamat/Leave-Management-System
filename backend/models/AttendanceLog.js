import { pool } from './db.js';

/**
 * @class AttendanceLog
 * AttendanceLog model for managing employee attendance logs.
 */
class AttendanceLog {
    /**
     * Insert a new time-in record.
     * 
     * @static
     * @async
     * @method timeIn
     * @param {number} employee_id - The ID of the employee.
     * @param {string|Date} time_in - The time the employee clocked in.
     * @param {string|Date|null} [date=null] - The date of the log (defaults to today if null).
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 28, 2025
     */
    static async insertAttendanceLog(employee_id, time_in, date = null) {
        const response_data = { status: false, result: null, error: null };

        try {
            const log_date = date ?? new Date().toISOString().split("T")[0];

            const [insert_time_in] = await pool.query(`
                INSERT INTO attendance_logs 
                    (employee_id, time_in, time_out, date, created_at, updated_at)
                VALUES (?, ?, NULL, ?, NOW(), NOW())
                `, [employee_id, time_in, log_date]
            );

            if(insert_time_in.affectedRows){
                response_data.status = true;
                response_data.result = { log_id: insert_time_in.insertId };
            } 
            else{
                response_data.error = "Failed to insert time-in";
            }
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    }

    /**
     * Update time-out for the log.
     * 
     * @static
     * @async
     * @method updateTimeOut
     * @param {string|Date} time_out - The time the employee clocked out.
     * @param {number} log_id - The ID of the attendance log to update.
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async updateTimeOut(time_out, log_id, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try{
            const [update_time_out] = await conn.query(`
                UPDATE attendance_logs
                SET time_out = ?, updated_at = NOW()
                WHERE id = ?
                AND time_out IS NULL
                LIMIT 1
                `, [time_out, log_id]
            );

            if(update_time_out.affectedRows){
                response_data.status = true;
                response_data.result = { log_id };
            } 
            else{
                response_data.error = 'Failed to update time-out';
            }
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    }

    /**
     * Fetch all attendance logs for a specific month.
     * 
     * @static
     * @async
     * @method fetchLogsByMonth
     * @param {number} year - The year (e.g., 2025).
     * @param {number} month - The month (1-12).
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async fetchLogsByMonth(year, month){
        const response_data = { status: false, result: null, error: null };

        try{
            const [monthly_log] = await pool.query(`
                SELECT attendance.id,
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    attendance.employee_id,
                    attendance.time_in,
                    attendance.time_out,
                    attendance.date
                FROM attendance_logs attendance
                LEFT JOIN employees AS employee ON attendance.employee_id = employee.id
                WHERE YEAR(attendance.time_in) = ? 
                AND MONTH(attendance.time_in) = ?
                ORDER BY attendance.id DESC
                `,[year, month]
            );

            if(monthly_log.length){
                response_data.status = true;
                response_data.result = monthly_log;
            } 
            else{
                response_data.error = 'No logs found';
            }
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    }

    /**
     * Fetch today's attendance status for a specific employee.
     * 
     * @static
     * @async
     * @method fetchTodayStatus
     * @param {number} employee_id - The ID of the employee.
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async fetchTodayStatus(employee_id, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try{
            const [attendance_status] = await conn.query(`
                SELECT id, time_in, time_out
                FROM attendance_logs
                WHERE employee_id = ?
                ORDER BY id DESC
                LIMIT 1
                `, [employee_id]
            );

            /* If there's a log and time_out is null, the employee is currently timed in */
            if(attendance_status.length){
                const log = attendance_status[0];
                response_data.status = true;
                response_data.result = {
                    is_timed_in: !!log.time_in && !log.time_out,
                    log_id: log.id,
                    time_in: log.time_in
                };
            } 
            else{
                response_data.result = { is_timed_in: false, log_id: null, time_in: null };
            }
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    }
}

export default AttendanceLog;

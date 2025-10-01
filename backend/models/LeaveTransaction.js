import {pool} from './db.js';

/**
 * @class LeaveRecord
 * Model for managing leave records.
 */
class LeaveTransaction {
    /**
     * Insert single or multiple leave records.
     * 
     * @static
     * @async
     * @method insertLeaveRecord
     * @param {Array} records - Array of leave record objects to insert. Each object should contain:
     *   - leave_application_id {number|null}
     *   - leave_transaction_type_id {number}
     *   - leave_type_time_unit_id {number}
     *   - attendance_log_exception_id {number|null}
     *   - quantity {number}    
     *   - date {string}
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} conn - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 30, 2025
     */
    static async insertLeaveRecord( records, conn = pool ) {
        const response_data = { status: false, result: null, error: null };

        try{
            if (!Array.isArray(records) || records.length === 0) {
                response_data.error = "No leave records provided";
            }

            /* Build placeholders for each record */
            const placeholders = records.map(() => "(?, ?, ?, ?, ?, ?, NOW(), NOW())").join(", ");

            /* Flatten values into one array */
            const values = records.flatMap(record => [
                record.leave_application_id,
                record.leave_transaction_type_id,
                record.leave_type_time_unit_id,
                record.attendance_log_exception_id,
                record.quantity,
                record.date
            ]);

            const [leave_transaction] = await conn.query(`
                INSERT INTO leave_transactions 
                    (leave_application_id, leave_transaction_type_id, leave_type_time_unit_id, attendance_log_exception_id, quantity, date, created_at, updated_at)
                VALUES ${placeholders}`,
                values
            );

            if(leave_transaction.affectedRows){
                response_data.status = true;
                response_data.result = { insert_id: leave_transaction.insertId };
            } 
            else{
                response_data.error = "Failed to insert leave transaction";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch all leave records in the system.
     * 
     * @static
     * @async
     * @method fetchAllLeaveRecords
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllLeaveTransactions(){
        const response_data = { status: false, result: null, error: null }

        try{
            const [leave_transactions] = await pool.query(`
                SELECT leave_transaction.id,
                    COALESCE(
						CONCAT(applicant.first_name, ' ', applicant.last_name),
						CONCAT(logger.first_name, ' ', logger.last_name)
					) AS employee_name,
                    leave_type.name AS leave_type,
                    leave_transaction.leave_transaction_type_id,
                    leave_transaction.quantity,
                    leave_transaction.date,
                    time_unit.name AS time_unit,
                    log_exception.is_overtime AS log_type,
                    transaction_type.name AS transaction_type
                FROM leave_transactions AS leave_transaction
				LEFT JOIN leave_applications AS application ON leave_transaction.leave_application_id =  application.id
                LEFT JOIN employees AS applicant ON application.employee_id = applicant.id
                LEFT JOIN leave_types AS leave_type ON application.leave_type_id = leave_type.id
                LEFT JOIN attendance_log_exceptions AS log_exception ON leave_transaction.attendance_log_exception_id = log_exception.id
                LEFT JOIN attendance_logs AS log ON log_exception.attendance_log_id = log.id
                LEFT JOIN employees AS logger ON log.employee_id = logger.id
                LEFT JOIN leave_transaction_types AS transaction_type ON leave_transaction.leave_transaction_type_id = transaction_type.id
                LEFT JOIN leave_type_time_units AS time_unit ON leave_transaction.leave_type_time_unit_id = time_unit.id
                ORDER BY leave_transaction.created_at DESC
            `);

            if(leave_transactions.length){
                response_data.status = true;
                response_data.result = leave_transactions;
            }
            else{
                response_data.error = 'No leave records found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch a specific leave record by ID.
     * 
     * @static
     * @async
     * @method fetchLeaveRecordById
     * @param {number} id - The ID of the leave record.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchLeaveRecordById(id){
        const response_data = { status: false, result: null, error: null }

        try{
            const [leave_transaction] = await pool.query(`
                SELECT  leave_transaction.id,
                        (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                        leave_types.leave_type,
                        leave_transaction.leave_transaction_type,
                        leave_transaction.quantity,
                        leave_transaction.datetime_unit,
                        leave_transaction.transaction_date
                FROM leave_transactions AS leave_transaction
                LEFT JOIN employees AS employee ON leave_transaction.employee_id = employee.id
                LEFT JOIN leave_types ON leave_transaction.leave_type_id = leave_types.id
                WHERE id = ? LIMIT 1
            `, [id]);

            if(leave_transaction.length){
                response_data.status = true;
                response_data.result = leave_transaction[0];
            }
            else{
                response_data.error = 'No leave record found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default LeaveTransaction;


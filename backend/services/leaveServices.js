import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";
import { pool } from "../models/db.js";

class LeaveServices {
    /**
     * Grant regular leave types to an employee if not already granted for the current year.
     * 
     * @async
     * @function grantRegularLeaveTypes
     * @param {number} employee_id - Employee ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>} - Returns an object with status, result, and error properties.
     * @author Rod
     * @lastupdated September 29, 2025
     */
    static grantRegularLeaveTypes = async (employee_id) => {
        const current_year = new Date().getFullYear();
        const response_data = { status: false, result: null, error: null };

        const conn = await pool.getConnection();
        try{
            await conn.beginTransaction();

            /* Get all non-special leave types */
            const leave_types_response = await EmployeeLeaveBalance.fetchNonSpecialLeaveTypes(conn);
            if(!leave_types_response.status)throw new Error(leave_types_response.error);

            const leave_type_ids = leave_types_response.result.map(leave_type => leave_type.id);

            /* Check if leave type has already been granted */
            const not_granted_response = await EmployeeLeaveBalance.fetchNotGrantedLeaveTypes(employee_id, leave_type_ids, current_year, conn);
            if(!not_granted_response.status) throw new Error('Failed to check if leave type has already been granted');

            const not_granted_ids = not_granted_response.result;

            const not_granted = leave_types_response.result.filter(
                leave_type => not_granted_ids.includes(leave_type.id)
            );

            if(not_granted.length === 0){
                await conn.commit();
                response_data.status = true;
                response_data.result = [];
                return response_data;
            }

            /* Grant leave type */
            const insert_balance = await EmployeeLeaveBalance.insertEmployeeLeaveBalance(
                employee_id,
                not_granted,
                current_year,
                conn
            );

            if(!insert_balance.status){
                throw new Error(`Failed to grant leave type  ${insert_balance.error}`);
            }

            await conn.commit();
            response_data.status = true;
            response_data.result = not_granted;
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
     * Grant special leave types to an employee if not already granted for the current year.
     * 
     * @async
     * @function grantSpecialLeaveTypes
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>} - Returns an object with status, result, and error properties.
     * @author Rod
     * @lastupdated September 29, 2025
     */
    static grantSpecialLeaveTypes = async (employee_id, leave_type_id) => {
        const current_year = new Date().getFullYear();
        const response_data = { status: false, result: null, error: null };

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            /* Get special leave type details */
            const leave_type_response = await EmployeeLeaveBalance.fetchSpecialLeaveType(leave_type_id, conn);
            if (!leave_type_response.status) throw new Error(leave_type_response.error);

            const leave_type = leave_type_response.result;
            const granted = [];

            /* Check if leave type has already been granted */
            const already_granted = await EmployeeLeaveBalance.hasLeaveTypeGranted(
                employee_id,
                leave_type.id,
                current_year,
                conn
            );

            /* Grant leave type */
            if(!already_granted.status){
                const insert_result = await EmployeeLeaveBalance.insertEmployeeLeaveBalance(
                    employee_id,
                    [ { id: leave_type.id, credit: leave_type.credit } ],
                    current_year,
                    conn
                );

                if(!insert_result.status){
                    throw new Error(`Failed to grant leave type ${leave_type.id}: ${insert_result.error}`);
                }

                granted.push({ leave_type_id: leave_type.id, insert_id: insert_result.result.insert_id });
            }

            await conn.commit();
            response_data.status = true;
            response_data.result = granted;
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
}

export default LeaveServices;
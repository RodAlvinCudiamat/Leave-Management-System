import EmployeeLeaveBalance from "../models/employeeLeaveBalanceModel.js";
import { pool } from "../models/db.js";

/**
 * Grant regular leave types to an employee if not already granted for the current year.
 * 
 * @async
 * @function grantRegularLeaveTypes
 * @param {number} employee_id - Employee ID
 * @returns {Promise<{status: boolean, result: object|null, error: string|null}>} - Returns an object with status, result, and error properties.
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const grantRegularLeaveTypes = async (employee_id) => {
    const current_year = new Date().getFullYear();
    const response_data = { status: false, result: null, error: null };

    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();

        /* Get all non-special leave types */
        const leave_types_response = await EmployeeLeaveBalance.fetchNonSpecialLeaveTypes(conn);
        if(!leave_types_response.status)throw new Error(leave_types_response.error);

        const leave_types = leave_types_response.result;
        const granted = [];

        /* Check if leave type has already been granted */
        for(const leave_type of leave_types){
            const already_granted = await EmployeeLeaveBalance.hasLeaveTypeGranted(employee_id, leave_type.id, current_year, conn);
            if(already_granted.status)continue;

            /* Grant leave type */
            const insert_result = await EmployeeLeaveBalance.insertEmployeeLeaveBalance(
                employee_id,
                leave_type.id,
                leave_type.credit,
                current_year,
                conn
            );

            if(!insert_result.status){
                throw new Error(`Failed to grant leave type ${leave_type.id}: ${insert_result.error}`);
            }

            granted.push({ leave_type_id: leave_type.id, ...insert_result.result });
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

/**
 * Grant special leave types to an employee if not already granted for the current year.
 * 
 * @async
 * @function grantSpecialLeaveTypes
 * @param {number} employee_id - Employee ID
 * @param {number} leave_type_id - Leave type ID
 * @returns {Promise<{status: boolean, result: object|null, error: string|null}>} - Returns an object with status, result, and error properties.
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const grantSpecialLeaveTypes = async (employee_id, leave_type_id) => {
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
                leave_type.id,
                leave_type.credit,
                current_year,
                conn
            );

            if(!insert_result.status){
                throw new Error(`Failed to grant leave type ${leave_type.id}: ${insert_result.error}`);
            }

            granted.push({ leave_type_id: leave_type.id, insertId: insert_result.result.insertId });
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

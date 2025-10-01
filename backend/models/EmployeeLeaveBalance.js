import {pool} from './db.js';
import { LEAVE_TYPE_IDS, MONTHLY_ACCRUAL_RATE, OVERTIME_MULTIPLIER, LEAVE_TYPE_GRANT_BASIS, IS_ACTIVE, DEFAULT_LEAVE_RECORD_VALUE } from '../config/constants.js';

/**
 * @class EmployeeLeaveBalance
 * EmployeeLeaveBalance model for managing employee leave balances.
 */
class EmployeeLeaveBalance {
    /**
     * Insert initial leave balances for an employee for a given year.
     * 
     * @static
     * @async
     * @method insertEmployeeLeaveBalance
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @param {number} starting_credit - Initial opening balance
     * @param {number} year - Year of the leave balance
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 28, 2025
     */
    static async insertEmployeeLeaveBalance(employee_id, leave_types, year, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try {
            if(!Array.isArray(leave_types) || leave_types.length === 0){
                response_data.error = "No leave types provided for insertion";
            }
            
            const now = new Date();

            const values = leave_types.map(leave_type => [
                employee_id,
                leave_type.id,
                leave_type.credit,
                leave_type.credit,
                year, 
                now,
                now
            ]);

            const [grant_leave] = await conn.query(`
                INSERT INTO employee_leave_balances
                    (employee_id, leave_type_id, starting_credit, remaining_credit, year, created_at, updated_at)
                VALUES ?
            `, [values]);

            if(grant_leave.affectedRows){
                response_data.status = true;
                response_data.result = { inserted: grant_leave.affectedRows };
            } 
            else{
                response_data.error = "Failed to grant leave types";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Update an employee's leave balance upon approval.
     * Deducts used leave and updates remaining credit.
     * 
     * @static
     * @async
     * @method updateLeaveBalanceOnApproval
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @param {number} total_days - Total leave days to deduct or add
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateLeaveBalanceOnApproval(employee_id, leave_type_id, total_days, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try {
            const update_balance_query = `
                UPDATE employee_leave_balances 
                SET used = used + ?, 
                    remaining_credit = remaining_credit - ?, 
                    updated_at = NOW()
                WHERE employee_id = ? AND leave_type_id = ?`;
            
            const params = [total_days, total_days, employee_id, leave_type_id];
            const [leave_balance] = await conn.query(update_balance_query, params);

            if(leave_balance.affectedRows){
                response_data.status = true;
                response_data.result = leave_balance;
            } 
            else{
                response_data.error = 'Failed to update leave balance';
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Update compensatory leave balance when employee earns leave from overtime.
     * Overtime hours are converted to leave credits with a 1.5 multiplier.
     * 
     * @static
     * @async
     * @method updateCompLeaveOnOvertime
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @param {number} overtime_hours - Number of overtime hours
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateCompLeaveOnOvertime(employee_id, leave_type_id, overtime_hours, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try{
            const credit_hours = overtime_hours * OVERTIME_MULTIPLIER;

            const [overtime_leave_balance] = await conn.query(`
                UPDATE employee_leave_balances
                SET earned = earned + ?, 
                    remaining_credit = remaining_credit + ?, 
                    updated_at = NOW()
                WHERE employee_id = ? AND leave_type_id = ?
                `, [credit_hours, credit_hours, employee_id, leave_type_id]
            );

            if(overtime_leave_balance.affectedRows){
                response_data.status = true;
                response_data.result = overtime_leave_balance;
            } 
            else{
                response_data.error = 'Failed to update compensatory leave balance (overtime)';
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Update compensatory leave balance when employee undertakes undertime.
     * Deducts leave credits based on undertime hours.
     * 
     * @static
     * @async
     * @method updateCompLeaveOnUndertime
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @param {number} undertime_hours - Number of undertime hours
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateCompLeaveOnUndertime(employee_id, leave_type_id, undertime_hours, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try{
            const [undertime_leave_balance] = await conn.query(`
                UPDATE employee_leave_balances
                SET deducted = deducted + ?, 
                    remaining_credit = remaining_credit - ?, 
                    updated_at = NOW()
                WHERE employee_id = ? AND leave_type_id = ?
                `, [undertime_hours, undertime_hours, employee_id, leave_type_id]
            );

            if(undertime_leave_balance.affectedRows){
                response_data.status = true;
                response_data.result = undertime_leave_balance;
            } 
            else{
                response_data.error = 'Failed to update compensatory leave balance (undertime)';
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Update sick leave and vacation leave balances for all employees monthly.
     * Increases earned and remaining credits by a fixed monthly accrual rate.
     * 
     * @static
     * @async
     * @method updateSLandVLMonthly
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateSLandVLMonthly(){
        const response_data = { status: false, result: null, error: null };

        try {
            const [leave_balance] = await pool.query( `
                UPDATE employee_leave_balances 
                SET earned = earned + ?, 
                    remaining_credit = remaining_credit + ?, 
                    updated_at = NOW()
                WHERE leave_type_id IN (?, ?)
                `, [ MONTHLY_ACCRUAL_RATE, MONTHLY_ACCRUAL_RATE, LEAVE_TYPE_IDS.VACATION_LEAVE, LEAVE_TYPE_IDS.SICK_LEAVE ]
            );

            if(leave_balance.affectedRows){
                response_data.status = true;
                response_data.result = leave_balance;
            } 
            else{
                response_data.error = 'Failed to update leave balance';
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Carry over unused vacation and sick leave to the next year.
     * Sets carry_in to remaining_credit, then recalculates remaining_credit.
     * Also resets earned, used, and deducted to 0.
     * 
     * @static
     * @async
     * @method carryOverVLandSL
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async carryOverVLandSL() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_balance] = await pool.query( `
                UPDATE employee_leave_balances 
                SET carry_in = remaining_credit,
                    remaining_credit = starting_credit + carry_in,
                    earned = ?,
                    used = ?,
                    deducted = ?,
                    updated_at = NOW()
                WHERE leave_type_id IN (?, ?);
                `, [ DEFAULT_LEAVE_RECORD_VALUE, DEFAULT_LEAVE_RECORD_VALUE, DEFAULT_LEAVE_RECORD_VALUE, LEAVE_TYPE_IDS.VACATION_LEAVE, LEAVE_TYPE_IDS.SICK_LEAVE ]
            );

            if(leave_balance.affectedRows){
                response_data.status = true;
                response_data.result = leave_balance;
            } 
            else{
                response_data.error = 'Failed to update leave balance';
            }
        } 
        catch(error){
            response_data.error = error.message;
        }
        return response_data;
    }

    /**
     * Fetch leave balance details for an employee.
     * 
     * @static
     * @async
     * @method fetchEmployeeLeaveBalance
     * @param {number} employee_id - Employee ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchEmployeeLeaveBalance(employee_id){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_balance] = await pool.query(`
                SELECT leave_balance.id AS leave_balance_id,
                    leave_balance.year,
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    leave_balance.leave_type_id,
                    leave_types.name as leave_type_name,
                    time_unit.name as leave_type_time_unit,
                    leave_balance.starting_credit,
                    leave_balance.earned,
                    leave_balance.used,
                    leave_balance.deducted,
                    leave_balance.carry_in,
                    leave_balance.remaining_credit
                FROM employee_leave_balances AS leave_balance
                LEFT JOIN employees AS employee ON leave_balance.employee_id = employee.id
                LEFT JOIN leave_types ON leave_balance.leave_type_id = leave_types.id
                LEFT JOIN leave_type_time_units AS time_unit ON leave_types.leave_type_time_unit_id = time_unit.id
                WHERE leave_balance.employee_id = ?
            `, [employee_id]);
            
            if(leave_balance.length) {
                response_data.status = true;
                response_data.result = leave_balance;
            }
            else{
                response_data.error = 'Leave balance not found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Fetch leave types that have not yet been granted to an employee for a given year.
     *
     * @static
     * @async
     * @method fetchUngrantedLeaveTypes
     * @param {number} employee_id - Employee ID
     * @param {number} year - Year to check
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchUngrantedLeaveTypes(employee_id, year){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_types] = await pool.query(`
                SELECT leave_type.id AS leave_type_id,
                   leave_type.name AS leave_type_name
                FROM leave_types AS leave_type
                LEFT JOIN employee_leave_balances AS leave_balance
                    ON leave_balance.leave_type_id = leave_type.id AND leave_balance.employee_id = ?
                WHERE leave_balance.id IS NULL 
                `,[employee_id, year]
            );

            if(leave_types.length) {
                response_data.status = true;
                response_data.result = leave_types;
            }
            else{
                response_data.error = 'Leave types not found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }
        
        return response_data;
    }

    /**
     * Check if a leave type has already been granted to an employee for a given year.
     * 
     * @static
     * @async
     * @method hasLeaveTypeGranted
     * @param {number} employee_id - Employee ID
     * @param {number} leave_type_id - Leave type ID
     * @param {number} year - Year to check
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async hasLeaveTypeGranted(employee_id, leave_type_id, year, conn = pool){
        const response_data = { status: false, result: null, error: null };

        try{

            const [granted_leave] = await conn.query(`
                SELECT id FROM employee_leave_balances 
                WHERE employee_id = ? AND leave_type_id = ? AND year = ?
                `, [employee_id, leave_type_id, year]
            );

            if(granted_leave.length){
                response_data.status = true; 
            } 
            else{
                response_data.error = "Leave type not granted"; 
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch leave types that have not yet been granted to an employee for a given year.
     *  
     * @static
     * @async
     * @method fetchNotGrantedLeaveTypes
     * @param {number} employee_id - Employee ID
     * @param {number[]} leave_type_ids - Array of leave type IDs
     * @param {number} year - Year to check
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 28, 2025  
     */
    static async fetchNotGrantedLeaveTypes(employee_id, leave_type_ids, year, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try{
            if(!Array.isArray(leave_type_ids) || leave_type_ids.length === 0){
                response_data.error = "No leave type IDs provided";
            }

            /* Fetch already granted leave types in one query */
            const [ungranted_leave] = await conn.query(`
                SELECT leave_type_id 
                FROM employee_leave_balances 
                WHERE employee_id = ? 
                AND year = ?
                AND leave_type_id IN (?)
                `, [employee_id, year, leave_type_ids]
            );

            const granted_ids = ungranted_leave.map(row => row.leave_type_id);

            /* Keep only not-yet-granted leave type IDs */
            const not_granted = leave_type_ids.filter(id => !granted_ids.includes(id));

            response_data.status = true;
            response_data.result = not_granted;
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch the total remaining leave balance for a specific leave type for an employee.
     * 
     * @static
     * @async
     * @method fetchTotalBalanceByLeaveType
     * @param {number} leave_type_id - Leave type ID
     * @param {number} employee_id - Employee ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchTotalBalanceByLeaveType(employee_id, leave_type_id){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_balance] = await pool.query(`
                SELECT remaining_credit 
                FROM employee_leave_balances 
                WHERE employee_id = ? AND leave_type_id = ?
                `, [employee_id, leave_type_id]
            );

            if(leave_balance.length){
                response_data.status = true;
                response_data.result = leave_balance[0].remaining_credit;
            } 
            else{
                response_data.error = "Leave balance not found";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Fetch all non-special leave types available for granting.
     * 
     * @static
     * @async
     * @method fetchNonSpecialLeaveTypes
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchNonSpecialLeaveTypes(conn = pool){
        const response_data = { status: false, result: null, error: null };

        try {
            const [leave_types] = await conn.query(`
                SELECT id, credit
                FROM leave_types 
                WHERE leave_type_grant_basis_id != ? AND is_active = ?
            ` , [LEAVE_TYPE_GRANT_BASIS.SPECIAL, IS_ACTIVE.TRUE]
        );

            if(leave_types.length === 0){
                response_data.error = "No active leave types to grant";
                return response_data;
            }
            else{
                response_data.status = true;
                response_data.result = leave_types;
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Fetch details of a special leave type by its ID.
     * 
     * @static
     * @async
     * @method fetchSpecialLeaveType
     * @param {number} leave_type_id - Leave type ID
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchSpecialLeaveType(leave_type_id, conn = pool){
        const response_data = { status: false, result: null, error: null };
   
        try {
            const [leave_type] = await conn.query(`
                SELECT id, credit
                FROM leave_types 
                WHERE id = ? AND leave_type_grant_basis_id = ?
                `, [leave_type_id, LEAVE_TYPE_GRANT_BASIS.SPECIAL]
            );

            if(leave_type.length === 0){
                response_data.error = "Leave type not found";
            }
            else{
                response_data.status = true;
                response_data.result = leave_type[0];
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };
}

export default EmployeeLeaveBalance;
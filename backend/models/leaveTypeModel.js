import {pool} from './db.js';
import { IS_ACTIVE } from '../config/constants.js';

/**
 * @class LeaveType
 * LeaveType model for managing different types of leaves.
 */
class LeaveType {
    /**
     * Constructor for the LeaveType class.
     *
     * @constructor
     * @param {number|null} id - The unique ID of the leave type (null for new records).
     * @param {string} leave_type_code - The code representing the leave type.
     * @param {string} leave_type - The name of the leave type.
     * @param {string} datetime_unit - The unit of time for the leave type (e.g., days, hours).
     * @param {string} earn_method - The method by which the leave is earned (e.g., monthly, yearly).
     * @param {number} earn_rate_per_month - The rate at which leave is earned per month.
     * @param {number} annual_grant_amount - The amount of leave granted annually.
     * @param {boolean} carryover_allowed - Indicates if carryover is allowed for the leave type.
     * @param {number} notice_days - The number of days of notice required for leave.
     * @param {boolean} file_upon_return - Indicates if a file is required upon return for the leave type.
     * @param {boolean} requires_approval - Indicates if approval is required for the leave type.
     */
    constructor(id, leave_type_code, leave_type, datetime_unit, earn_method, earn_rate_per_month, annual_grant_amount, carryover_allowed, notice_days, file_upon_return, requires_approval) {
        this.id = id;
        this.leave_type_code = leave_type_code;
        this.leave_type = leave_type;
        this.datetime_unit = datetime_unit;
        this.earn_method = earn_method;
        this.earn_rate_per_month = earn_rate_per_month;
        this.annual_grant_amount = annual_grant_amount;
        this.carryover_allowed = carryover_allowed;
        this.notice_days = notice_days;
        this.file_upon_return = file_upon_return;
        this.requires_approval = requires_approval;
    }

    /**
     * Fetch all leave types.
     * Retrieves all leave type records from the database.
     * 
     * @static
     * @async
     * @method fetchAllLeaveTypes
     * @returns {Promise<{status: boolean, result: object[], error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllLeaveTypes(){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_types] = await pool.query(`
                SELECT 
                    leave_type.id,
                    leave_type.leave_type_grant_basis_id,
                    leave_type.leave_type_time_unit_id,
                    leave_type.code,
                    leave_type.name AS leave_name,
                    leave_type.credit,
                    leave_type.notice_days,
                    leave_type.overtime_multiplier,
                    leave_type.is_future_filing_allowed,
                    leave_type.is_approval_needed,
                    leave_type.is_carried_over,
                    leave_type.is_active,
                    grant_basis.name AS grant_basis,
                    time_unit.name AS time_unit
                FROM leave_types AS leave_type
                LEFT JOIN leave_type_grant_basis AS grant_basis ON leave_type.leave_type_grant_basis_id = grant_basis.id
                LEFT JOIN leave_type_time_units AS time_unit ON leave_type.leave_type_time_unit_id = time_unit.id
                WHERE leave_type.is_active = ?
                ORDER BY leave_type.id ASC
                `, [IS_ACTIVE.TRUE]);

            if(leave_types.length){
                response_data.status = true;
                response_data.result = leave_types;
            }
            else{
                response_data.error = 'No leave types found';
            }
        }
        catch(error){
            /* Return any error encountered */
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch a specific leave type by ID.
     * 
     * @static
     * @async
     * @method fetchLeaveTypeById
     * @param {number} id - The ID of the leave type.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchLeaveTypeById(id){
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_type] = await pool.query(`
                SELECT * 
                FROM leave_types 
                WHERE id = ? LIMIT 1
                `, [id]);

            if(leave_type.length){
                response_data.status = true;
                response_data.result = leave_type[0];
            }
            else{
                response_data.error = 'No leave type found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }   

        return response_data;
    }

    /**
     * Update a leave type by ID.
     * 
     * @static
     * @async
     * @method updateLeaveTypeById
     * @param {object} data - The data to update the leave type with.
     * @param {number} id - The ID of the leave type to update.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateLeaveTypeById(data, id){
        const response_data = { status: false, result: null, error: null };

        try {
            /* Exclude created_at */
            const { created_at, ...update_data } = data;

            /* Only include fields that have a value */
            const fields = [];
            const values = [];
            for (const key in update_data) {
                if(update_data[key] !== undefined){
                    fields.push(`\`${key}\` = ?`);
                    values.push(update_data[key]);
                }
            }

            if(fields.length === 0){
                response_data.error = "No fields to update";
                return response_data;
            }

            /* Only update updated_at if there are actual changes to be made */
            fields.push("updated_at = NOW()");

            const update_leave_type_query = `
                UPDATE leave_types 
                SET ${fields.join(", ")} 
                WHERE id = ? LIMIT 1
                `;

            values.push(id);

            const [update_leave_type] = await pool.query(update_leave_type_query, values);

            response_data.status = (!!update_leave_type.affectedRows);
            response_data.result = update_leave_type;
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    };

    /**
     * Delete (soft delete) a leave type by ID.
     * 
     * @static
     * @async
     * @method deleteLeaveTypeById
     * @param {number} id - The ID of the leave type to delete.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async deleteLeaveTypeById(id){
        const response_data = { status: false, result: null, error: null };

        try{
            const [delete_leave_type] = await pool.query(`
                UPDATE leave_types 
                SET is_active = 0 
                WHERE id = ? LIMIT 1
                `, [id]);

            if(delete_leave_type.affectedRows){
                response_data.status = true;
                response_data.result = delete_leave_type;
            }
            else{
                response_data.error = 'Failed to delete leave type';
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default LeaveType;









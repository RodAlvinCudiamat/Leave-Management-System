import { pool } from "./db.js";

/**
 * @class LeaveTypeTimeUnit
 * Model for managing leave type time units.
 */
class LeaveTypeTimeUnit {
    /**
     * Fetch all leave type time units.
     * 
     * @static
     * @async
     * @method fetchAllLeaveTypeTimeUnits
     * @returns {Promise<{status: boolean, result: object[], error: string}>} Returns an object with status, result, and error properties.
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllLeaveTypeTimeUnits() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_type_time_units] = await pool.query(`
                SELECT * 
                FROM leave_type_time_units`
            );

            if(leave_type_time_units.length){
                response_data.status = true;
                response_data.result = leave_type_time_units;
            } 
            else{
                response_data.error = "No leave type time units found";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default LeaveTypeTimeUnit;
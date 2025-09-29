import { pool } from "./db.js";

/**
 * @class LeaveTypeGrantBasis
 * Model for managing leave type grant basis.
 */
class LeaveTypeGrantBasis {

    /**
     * Fetch all leave type grant basis.
     * 
     * @static
     * @async
     * @method fetchAllLeaveTypeGrantBasis
     * @returns {Promise<{status: boolean, result: object[], error: string}>} Returns an object with status, result, and error properties.
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllLeaveTypeGrantBasis() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_type_grant_basis] = await pool.query(`
                SELECT * 
                FROM leave_type_grant_basis
            `);

            if(leave_type_grant_basis.length){
                response_data.status = true;
                response_data.result = leave_type_grant_basis;
            } 
            else{
                response_data.error = "No leave type grant basis found";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default LeaveTypeGrantBasis;
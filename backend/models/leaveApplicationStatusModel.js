import { pool } from "./db.js";

/**
 * @class LeaveApplicationStatus
 * Model for managing leave application statuses.
 */
class LeaveApplicationStatus {

    /**
     * Fetch status ID by its name.
     * 
     * @static
     * @async
     * @method fetchStatusIdByName
     * @param {string} status - Status name (e.g., 'pending', 'approved', 'rejected').
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} [conn=pool] - Database connection or pool.
     * @returns {Promise<{status: boolean, result: number|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchStatusIdByName(status, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try {
            const [fetch_status] = await conn.query(`
                SELECT id, name
                FROM leave_application_statuses
                WHERE LOWER(name) = ? 
                LIMIT 1
                `, [status.toLowerCase()]
            );

            if(fetch_status.length){
                response_data.status = true;
                response_data.result = fetch_status[0].id;
            } 
            else{
                response_data.error = `Invalid status: ${status}`;
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

}

export default LeaveApplicationStatus;

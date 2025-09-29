import { pool } from "./db.js";

/**
 * @class LeaveGrantRequest
 * Model for managing leave grant requests.
 */
class LeaveGrantRequest {
    /**
     * Constructor for the LeaveGrantRequest class.
     * 
     * @constructor
     * @param {number|null} id - The unique ID of the leave grant request (null for new records).
     * @param {number} employee_id - The ID of the employee requesting leave.
     * @param {number} leave_type_id - The ID of the leave type being requested.
     * @param {number} leave_application_status_id - The ID of the current status of the leave application.
     */
    constructor(id, employee_id, leave_type_id, leave_application_status_id) {
        this.id = id;
        this.employee_id = employee_id;
        this.leave_type_id = leave_type_id;
        this.leave_application_status_id = leave_application_status_id;
    }
    
    /**
     * Insert a new leave grant request into the database.
     * 
     * @async
     * @method insert
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    async insert() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [insert_leave_grant_request] = await pool.query(`
                INSERT INTO leave_grant_requests
                (employee_id, leave_type_id, leave_application_status_id, requested_at, created_at, updated_at)
                VALUES (?, ?, ?, NOW(), NOW(), NOW())
            `, [this.employee_id, this.leave_type_id, this.leave_application_status_id]);

            if(insert_leave_grant_request.affectedRows > 0){
                response_data.status = true;
                response_data.result = { leave_grant_request_id: insert_leave_grant_request.insertId };
            } 
            else{
                response_data.error = "Failed to insert leave grant request";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
    /**
     * Static helper for quick insert
     * 
     * @static
     * @async
     * @method insertLeaveGrantRequest
     * @param {number} employee_id - The ID of the employee requesting leave.
     * @param {number} leave_type_id - The ID of the leave type being requested.
     * @param {number} leave_application_status_id - The ID of the current status of the leave application.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async insertLeaveGrantRequest(employee_id, leave_type_id, leave_application_status_id) {
        const leave_grant_request = new LeaveGrantRequest(null, employee_id, leave_type_id, leave_application_status_id, null, null);
        return await leave_grant_request.insert();
    }

    /**
     * Fetch all leave grant requests in the system.
     * Includes employee name, leave type, status, and request date.
     * 
     * @static
     * @async
     * @method fetchAllLeaveGrantRequests
     * @returns {Promise<{status: boolean, result: object[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllLeaveGrantRequests() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [leave_grant_requests] = await pool.query(`
                 SELECT 
                    grant_request.id AS leave_grant_request_id,
                    (CONCAT(employee.first_name, ' ', employee.last_name)) AS employee_name,
                    leave_type.name AS leave_type_name,
                    leave_status.name AS leave_application_status_name,
                    grant_request.requested_at
                FROM leave_grant_requests AS grant_request
                LEFT JOIN employees AS employee ON grant_request.employee_id = employee.id
                LEFT JOIN leave_types AS leave_type ON grant_request.leave_type_id = leave_type.id
                LEFT JOIN leave_application_statuses AS leave_status ON grant_request.leave_application_status_id = leave_status.id
                ORDER BY grant_request.created_at DESC
            `);

            if(leave_grant_requests.length){
                response_data.status = true;
                response_data.result = leave_grant_requests;
            } 
            else{
                response_data.error = "No leave grant requests found";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Update the status of a leave grant request.
     * 
     * @static
     * @async
     * @method updateLeaveGrantRequestStatus
     * @param {number} leave_grant_request_id - The ID of the leave grant request to update.
     * @param {number} leave_application_status_id - The ID of the new leave application status.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateLeaveGrantRequestStatus(leave_grant_request_id, leave_application_status_id, conn = pool) {
        const response_data = { status: false, result: null, error: null };

        try{
            const [update_leave_grant_request] = await conn.query(`
                UPDATE leave_grant_requests
                SET leave_application_status_id = ?, updated_at = NOW()
                WHERE id = ?
            `, [leave_application_status_id, leave_grant_request_id]);

            if(update_leave_grant_request.affectedRows){
                response_data.status = true;
                response_data.result = { leave_grant_request_id, leave_application_status_id };
            } 
            else{
                response_data.error = "Failed to update leave grant request status";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Fetch a leave grant request by its ID.
     *
     * @static
     * @async
     * @method fetchLeaveGrantRequestById 
     * @param {number} leave_grant_request_id - The ID of the leave grant request to fetch.
     * @param {import("mysql2/promise").PoolConnection|import("mysql2/promise").Pool} conn - Database connection or pool.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchLeaveGrantRequestById(leave_grant_request_id, conn) {
        const response_data = { status: false, result: null, error: null };

        try{
            const [fetch_grant_request] = await conn.query(
                `SELECT id AS leave_grant_request_id, 
                    employee_id, 
                    leave_application_status_id, 
                    leave_type_id
                FROM leave_grant_requests 
                WHERE id = ?
                `, [leave_grant_request_id]
            );

            if(fetch_grant_request.length){
                response_data.status = true;
                response_data.result = fetch_grant_request[0];
            } 
            else{
                response_data.error = "Leave grant request not found";
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default LeaveGrantRequest;
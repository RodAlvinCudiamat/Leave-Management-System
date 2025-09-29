import LeaveGrantRequest from "../models/leaveGrantRequestModel.js";
import { grantSpecialLeaveTypes } from "../services/leaveServices.js";
import { APPLICATION_STATUS } from "../config/constants.js";
import { pool } from "../models/db.js";

/**
 * Controller: Insert a new leave grant request
 * Creates a new leave grant request in the database.
 * 
 * @async
 * @function insertLeaveGrantRequest
 * @param {*} req - Express request object, expects `employee_id`, `leave_type_id`, and `leave_application_status_id` in `req.body`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const insertLeaveGrantRequest = async (req, res) => {
    const employee_id = req.body.employee_id;
    const leave_type_id = req.body.leave_type_id;
    const leave_application_status_id = req.body.leave_application_status_id;

    try{
        const leave_grant_request = await LeaveGrantRequest.insertLeaveGrantRequest(employee_id, leave_type_id, leave_application_status_id);
        
        if(leave_grant_request.status){
            return res.json({ success: true, message: "Leave grant request inserted successfully", leave_grant_request: leave_grant_request.result });
        } 
        else{
            return res.json({ success: false, error: leave_grant_request.error });
        }
    } 
    catch(error){
        return res.json({ success: false, error: error.message });
    }
};

/**
 * Controller: Fetch all leave grant requests
 * Fetches all leave grant requests from the database.
 * 
 * @async
 * @function fetchAllLeaveGrantRequests
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs 
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchAllLeaveGrantRequests = async (req, res) => {
    try{
        const leave_grant_requests = await LeaveGrantRequest.fetchAllLeaveGrantRequests();

        if(leave_grant_requests.status){
            return res.json({ success: true, result: leave_grant_requests.result });
        }
        else{
            return res.json({ success: false, error: leave_grant_requests.error });
        }
    } 
    catch(error){
        return res.json({ success: false, error: error.message });
    }
};

/**
 * Controller: Update leave grant request status
 * Updates the status of a leave grant request. If approved, it also grants the special leave type to the employee.
 * 
 * @async
 * @function updateLeaveGrantRequest
 * @param {*} req - Express request object, expects `id` in `req.params` and `leave_application_status_id` in `req.body`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const updateLeaveGrantRequest = async (req, res) => {
    const leave_grant_request_id = Number(req.params.id);
    const leave_application_status_id = Number(req.body.leave_application_status_id);

    const conn = await pool.getConnection();
    try{
        await conn.beginTransaction();

        /* First update */
        const updated_leave_grant_request = await LeaveGrantRequest.updateLeaveGrantRequestStatus(
            leave_grant_request_id,
            leave_application_status_id,
            conn 
        );

        if(!updated_leave_grant_request.status){
            await conn.rollback();
            return res.json({ success: false, error: updated_leave_grant_request.error });
        }

        /* Then fetch full record (with employee_id) */
        const fetch_request = await LeaveGrantRequest.fetchLeaveGrantRequestById(
            leave_grant_request_id,
            conn 
        );

        if(!fetch_request.status){
            await conn.rollback();
            return res.json({ success: false, error: fetch_request.error });
        }

        let granted_special_leave = [];

        /* If approved, grant the special leave type */
        if(leave_application_status_id === APPLICATION_STATUS.APPROVED){
            const employee_id = fetch_request.result.employee_id;
            const leave_type_id = fetch_request.result.leave_type_id;
            const grant_response = await grantSpecialLeaveTypes(employee_id, leave_type_id, conn); 

            if(!grant_response.status){
                await conn.rollback();
                return res.json({
                    success: false,
                    error: `Leave request approved but failed to grant special leave: ${grant_response.error}`
                });
            }

            granted_special_leave = grant_response.result;
        }

        await conn.commit();
        return res.json({
            success: true,
            message: "Leave grant request updated successfully",
            leave_grant_request: fetch_request.result,
            granted_special_leave
        });
    } 
    catch(error){
        await conn.rollback();
        return res.json({ success: false, error: error.message });
    } 
    finally{
        conn.release();
    }
};


import ApplicationDays from "../models/leaveApplicationDayModel.js";
import LeaveApplicationStatus from "../models/leaveApplicationStatusModel.js";
import EmployeeLeaveBalance from "../models/employeeLeaveBalanceModel.js";
import LeaveRecord from "../models/leaveTransactionModel.js";
import { LEAVE_TRANSACTION_TYPE, TIME_UNIT, FRACTION_DAYS } from "../config/constants.js";
import { pool } from "../models/db.js";

/**
 * Controller: Fetch leave application days by application ID
 * Fetches all days covered by a specific leave application.
 * 
 * @async
 * @function fetchLeaveApplicationDays
 * @param {*} req - Express request object, expects `application_id` in `req.params`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchLeaveApplicationDays = async (req, res) => {
    const { application_id } = req.params;

    try{
        const application_days = await ApplicationDays.fetchLeaveApplicationDays(application_id);

        if(application_days.status){
            return res.json({ success: true, result: application_days.result });
        }
        else{
            return res.json({ success: false, error: application_days.error });
        }    
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }
};

/**
 * Controller: Fetch all leave application days
 * Fetches all days associated with all leave applications.
 * 
 * @async
 * @function fetchAllLeaveApplicationsDays
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchAllLeaveApplicationsDays = async (req, res) => {
    try{
        const all_application_days = await ApplicationDays.fetchAllLeaveApplicationDays();

        if(all_application_days.status){
            return res.json({ success: true, result: all_application_days.result });
        }
        else{
            return res.json({ success: false, error: all_application_days.error });
        }
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }   
}

/**
 * Controller: Update leave application day status
 * Updates status (approved/rejected/etc.) per day and adjusts leave balances if approved.
 * 
 * @async
 * @function updateApplicationDayStatus
 * @param {*} req - Express request object, expects `day_ids`, `status`, and `approver_id` in `req.body`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful 
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const updateApplicationDayStatus = async (req, res) => {
    const conn = await pool.getConnection();

    try{
        const { day_ids, status, approver_id } = req.body;
        const ids = Array.isArray(day_ids) ? day_ids : [day_ids];

        await conn.beginTransaction();

        /* Fetch status ID by name */
        const status_lookup = await LeaveApplicationStatus.fetchStatusIdByName(status, conn);

        if(!status_lookup.status){
            await conn.rollback();
            return res.json(status_lookup);
        }

        const status_id = status_lookup.result;

        for(const day_id of ids){
            /* Update the leave_application_days row */
            const update_day = await ApplicationDays.updateApplicationDayStatus(
                day_id,
                status_id,
                approver_id,
                conn
            );

            if(!update_day.status){
                await conn.rollback();
                return res.json(update_day);
            }

            /* If approved → deduct balance + create transaction */
            if(status.toLowerCase() === "approved"){
                const day_details = await ApplicationDays.fetchDayWithApplication(day_id, conn);

                if(!day_details.status || !day_details.result){
                    await conn.rollback();
                    return res.json({ status: false, error: "Day details not found" });
                }

                const { application_id, employee_id, leave_type_id } = day_details.result;

                /* Check if employee has enough leave balance */
                const balance_check = await EmployeeLeaveBalance.fetchTotalBalanceByLeaveType(
                    employee_id,
                    leave_type_id
                );

                if(!balance_check.status){
                    await conn.rollback();
                    return res.json(balance_check); // e.g., "Leave balance not found"
                }

                if(balance_check.result < FRACTION_DAYS.WHOLE){
                    await conn.rollback();
                    return res.json({ status: false, error: "Insufficient leave balance" });
                }

                /* Create leave transaction record */
                const leave_record = await LeaveRecord.insertLeaveRecord(
                    application_id,   
                    LEAVE_TRANSACTION_TYPE.USE, 
                    TIME_UNIT.DAY,                                  
                    null,                    
                    FRACTION_DAYS.WHOLE,                        
                    new Date(),              
                    conn
                );


                if(!leave_record.status){
                    await conn.rollback();
                    return res.json(leave_record);
                }

                /* Deduct from balance */
                const leave_balance = await EmployeeLeaveBalance.updateLeaveBalanceOnApproval(
                    employee_id,
                    leave_type_id,
                    FRACTION_DAYS.WHOLE,
                    conn
                );

                if(!leave_balance.status){
                    await conn.rollback();
                    return res.json(leave_balance);
                }
            }
        }

        await conn.commit();
        return res.json({
            status: true,
            message: `Day(s) [${ids.join(", ")}] updated to ${status}`,
        });
    } 
    catch(err){
        await conn.rollback();
        return res.json({ status: false, error: err.message });
    } 
    finally{
        conn.release();
    }
};
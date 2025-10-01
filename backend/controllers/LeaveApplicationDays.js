import ApplicationDays from "../models/LeaveApplicationDay.js";
import LeaveApplicationStatus from "../models/LeaveApplicationStatus.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";
import LeaveRecord from "../models/LeaveTransaction.js";
import { LEAVE_TRANSACTION_TYPE, TIME_UNIT, FRACTION_DAYS, REGULAR_WORK_HOURS } from "../config/constants.js";
import { pool } from "../models/db.js";

class LeaveApplicationDays {
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
    static fetchLeaveApplicationDays = async (req, res) => {
        const { application_id } = req.params; /* application_id is optional */

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
    static updateApplicationDayStatus = async (req, res) => {
        const conn = await pool.getConnection();

        try{
            const { day_ids, status, approver_id } = req.body;
            const ids = Array.isArray(day_ids) ? day_ids : [day_ids];

            await conn.beginTransaction();

            /* Fetch status ID by name */
            const status_lookup = await LeaveApplicationStatus.fetchStatusIdByName(
                status, 
                conn
            );

            if(!status_lookup.status){
                await conn.rollback();
                return res.json(status_lookup);
            }

            const status_id = status_lookup.result;

            /* Update application day status */
            const update_day = await ApplicationDays.updateApplicationDayStatus(
                ids,
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
                const day_details = await ApplicationDays.fetchDayWithApplication(ids, conn);

                if(!day_details.status){
                    await conn.rollback();
                    return res.json({ day_details });
                }

                const days = day_details.result;
                const { employee_id, leave_type_id, time_unit_name } = days[0]; 
                
                let unit_quantity;
                let total_quantity;
                let time_unit_id;

                if(time_unit_name.toLowerCase() === "hour"){
                    unit_quantity = REGULAR_WORK_HOURS;
                    total_quantity = days.length * REGULAR_WORK_HOURS;
                    time_unit_id = TIME_UNIT.HOUR;
                }
                else{
                    unit_quantity = FRACTION_DAYS.WHOLE;
                    total_quantity = days.length * FRACTION_DAYS.WHOLE;
                    time_unit_id = TIME_UNIT.DAY;
                }

                /* Check if employee has enough leave balance */
                const balance_check = await EmployeeLeaveBalance.fetchTotalBalanceByLeaveType(
                    employee_id,
                    leave_type_id
                );

                if(!balance_check.status){
                    await conn.rollback();
                    return res.json(balance_check);
                }

                if(balance_check.result < unit_quantity){
                    await conn.rollback();
                    return res.json({ status: false, error: "Insufficient leave balance" });
                }

                /* Prepare records for bulk insert */
                const records = days.map(day => ({
                    leave_application_id: day.application_id,
                    leave_transaction_type_id: LEAVE_TRANSACTION_TYPE.USE,
                    leave_type_time_unit_id: time_unit_id,
                    attendance_log_exception_id: null,
                    quantity: unit_quantity,
                    date: day.date
                }));

                /* Create leave transaction record */
                const leave_record = await LeaveRecord.insertLeaveRecord(
                    records,              
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
                    total_quantity,
                    conn
                );

                if(!leave_balance.status){
                    await conn.rollback();
                    return res.json(leave_balance);
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
}

export default LeaveApplicationDays;
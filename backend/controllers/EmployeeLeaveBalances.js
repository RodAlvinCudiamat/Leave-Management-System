import EmployeeLeaveBalance  from "../models/EmployeeLeaveBalance.js";
import cron from "node-cron";

/**
 * CRON Jobs: Leave Balance Accrual
 * 
 * 1. Monthly Accrual:
 *    Runs on the 1st day of every month at midnight (00:00).  
 *    - Calls `EmployeeLeaveBalance.updateSLandVLMonthly()` to accrue Sick Leave (SL) and Vacation Leave (VL).
 * 
 * 2. Yearly Carry Over:
 *    Runs on January 1st at midnight (00:00).  
 *    - Calls `EmployeeLeaveBalance.carryOverVLandSL()` to carry over unused VL and SL credits to the new year.
 * 
 * @module CronJobs/LeaveAccrual
 * @requires node-cron
 * @requires EmployeeLeaveBalance
 */
cron.schedule("0 0 1 * * ", async () => {
    try{
        console.log("Accruing monthly VL/SL...");
        const accrued_result = await EmployeeLeaveBalance.updateSLandVLMonthly();
        console.log("Accrual result:", accrued_result);
    } 
    catch(err){
        console.error("Failed to accrue VL/SL:", err.message);
    }
});

cron.schedule("0 0 1 1 * *", async () => {
    try{
        console.log("Accruing yearly VL/SL...");
        const accrued_result = await EmployeeLeaveBalance.carryOverVLandSL();
        console.log("Accrual result:", accrued_result);
    } 
    catch(err){
        console.error("Failed to accrue VL/SL:", err.message);
    }
});

class EmployeeLeaveBalances {
    /**
     * Controller: Fetch Employee Leave Balance
     * Fetches the leave balance details for the given employee.
     * 
     * @async
     * @function fetchEmployeeLeaveBalance
     * @param {*} req - Express request object, expects `employee_id` in `req.params`.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static fetchEmployeeLeaveBalance = async (req, res) => {
        const { employee_id } = req.params;

        try{
            const employee_balance = await EmployeeLeaveBalance.fetchEmployeeLeaveBalance(employee_id);

            if(employee_balance.status){
                return res.json({ success: true, result: employee_balance.result });
            }
            else{
                return res.json({ success: false, error: employee_balance.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };

    /**
     * Controller: Fetch Ungranted Leave Types
     * Fetches leave types that have not yet been granted to the specified employee for the given year.
     * 
     * @async
     * @function fetchUngrantedLeaveTypes
     * @param {*} req - Express request object, expects `employee_id` and `year` in `req.params`.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object[] }` if successful
     * - `{ success: false, error: string }` if an error occurs 
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static fetchUngrantedLeaveTypes = async (req, res) => {
        const { employee_id, year } = req.params;

        try{
            const ungranted_leave_types = await EmployeeLeaveBalance.fetchUngrantedLeaveTypes(employee_id, year);
            
            if(ungranted_leave_types.status){
                return res.json({ success: true, result: ungranted_leave_types.result });
            }
            else{
                return res.json({ success: false, error: ungranted_leave_types.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    }

    /**
     * Controller: Fetch Logged-in Employee's Leave Balance
     * Fetches the leave balance details for the currently logged-in employee using session data.
     * 
     * @async
     * @function fetchMyLeaveBalance
     * @param {*} req - Express request object, expects a valid session with `req.session.user`.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static fetchMyLeaveBalance = async (req, res) => {
        try{
            if(!req.session.user) {
                return res.json({ success: false, error: "Not logged in." });
            }
            else{
                const logged_employee_balance = await EmployeeLeaveBalance.fetchEmployeeLeaveBalance(req.session.user.id);

                if(logged_employee_balance.status){
                    return res.json({ success: true, result: logged_employee_balance.result });
                }
                else{
                    return res.json({ success: false, error: logged_employee_balance.error });
                }
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };
}

export default EmployeeLeaveBalances;


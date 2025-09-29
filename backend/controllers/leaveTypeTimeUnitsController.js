import LeaveTypeTimeUnit from "../models/leaveTypeTimeUnitModel.js";

/**
 * Controller: Fetch All Leave Type Time Units
 * Fetches all leave type time units from the database.
 * 
 * @async
 * @function fetchAllLeaveTypeTimeUnits
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const fetchAllLeaveTypeTimeUnits = async (req, res) => {
    try {
        const leave_type_time_units = await LeaveTypeTimeUnit.fetchAllLeaveTypeTimeUnits();

        if(leave_type_time_units.status){
            return res.json({ success: true, result: leave_type_time_units.result });
        }
        else{
            return res.json({ success: false, error: leave_type_time_units.error });
        }
    } 
    catch(error){
        return res.json({ success: false, error: error.message });
    }
}
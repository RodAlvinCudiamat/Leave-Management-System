import LeaveTypeGrantBasis from "../models/LeaveTypeGrantBasis.js";

class LeaveTypeGrantBases {
    /**
     * Controller: Fetch All Leave Type Grant Basis
     * Fetches all leave type grant basis from the database.
     * 
     * @async
     * @function fetchAllLeaveTypeGrantBasis
     * @param {*} req - Express request object
     * @param {*} res - Express response object
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object[] }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static fetchAllLeaveTypeGrantBasis = async (req, res) => {
        try{
            const leave_type_grant_basis = await LeaveTypeGrantBasis.fetchAllLeaveTypeGrantBasis();

            if(leave_type_grant_basis.status){
                return res.json({ success: true, result: leave_type_grant_basis.result });
            } 
            else{
                return res.json({ success: false, error: leave_type_grant_basis.error });
            }
        } 
        catch(error){
            return res.json({ success: false, error: error.message });
        }
    };
}

export default LeaveTypeGrantBases;
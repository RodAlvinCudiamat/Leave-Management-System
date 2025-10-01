import LeaveTransaction from "../models/LeaveTransaction.js";

class LeaveTransactions {
    /**
     * Controller: Fetch all leave records
     * Fetches all leave records from the database.
     * 
     * @async
     * @function fetchAllLeaveTransaction
     * @param {*} req - Express request object
     * @param {*} res - Express response object
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object[] }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static fetchAllLeaveTransaction = async (req, res) => {
        try {
            const all_leave_records = await LeaveTransaction.fetchAllLeaveTransactions();

            if(all_leave_records.status){
                return res.json({ success: true, result: all_leave_records.result });
            }
            else{
                return res.json({ success: false, error: all_leave_records.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };

    /**
     * Controller: Fetch leave record by ID
     * Fetches a single leave record by its unique ID.
     * 
     * @async
     * @function fetchLeaveRecordById
     * @param {*} req - Express request object, expects `id` in `req.params`.
     * @param {*} res - Express response object
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static fetchLeaveRecordById = async (req, res) => {
        const { id } = req.params;

        try{
            const leave_record = await LeaveTransaction.fetchLeaveRecordById(id);

            if(leave_record.status){
                return res.json({ success: true, result: leave_record.result });
            }
            else{
                return res.json({ success: false, error: leave_record.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };
}

export default LeaveTransactions;
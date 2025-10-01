import e from "express";
import AttendanceLogException from "../models/AttendanceLogException.js";

class AttendanceLogExceptions {
    /**
     * Controller: Fetch All Attendance Log Exceptions
     * Fetches all attendance log exceptions from the database.
     * 
     * @async
     * @function fetchAllLogExceptions
     * @param {*} req - Express request object
     * @param {*} res - Express response object
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object[] }` if successful
     * - `{ success: false, error: string }` if an error occurs 
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static fetchAllLogExceptions = async (req, res) => {
        try{
            const log_exceptions = await AttendanceLogException.fetchLogExceptions();
            
            if(log_exceptions.status){
                return res.json({ success: true, result: log_exceptions.result });
            }
            else{
                return res.json({ success: false, error: log_exceptions.error });
            }
        } 
        catch (error) {
            return res.json({ success: false, error: error.message });
        }
    }
}

export default AttendanceLogExceptions;

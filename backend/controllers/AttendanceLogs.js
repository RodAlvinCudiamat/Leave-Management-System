import AttendanceLog from "../models/AttendanceLog.js";
import AttendanceLogException from "../models/AttendanceLogException.js";
import EmployeeLeaveBalance from "../models/EmployeeLeaveBalance.js";
import LeaveRecord from "../models/LeaveTransaction.js";
import { calculateOvertimeUndertime, calculateWorkedHours, isOvertimeThresholdExceeded } from "../helpers/AttendanceLogHelpers.js";
import { IS_OVERTIME, LEAVE_TRANSACTION_TYPE, TIME_UNIT, LEAVE_TYPE_IDS, REGULAR_WORK_HOURS } from "../config/constants.js";
import { pool } from "../models/db.js";

class AttendanceLogs {
    /**
     * Controller: Handle Time-In
     * Creates a new time-in record for the logged-in employee.
     * 
     * @async
     * @function handleTimeIn
     * @param {*} req - Express request object, expects a valid session with `req.session.user`.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response:
     * - `{ status: true, message: string, result: object }` if successful
     * - `{ status: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static handleTimeIn = async (req, res) => {
        const { id: employee_id } = req.session.user; 
        const time_in = new Date();

        try{
            const timed_in = await AttendanceLog.insertAttendanceLog( employee_id, time_in );

            if(!timed_in.status){
                return res.json(timed_in);
            }

            return res.json({
                status: true,
                message: "Time-in recorded successfully",
                result: { ...timed_in.result, time_in }
            });
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };


    /**
     * Controller: Handle Time-Out
     * Records the employee's time-out for the current day.  
     * - Verifies if there is an active time-in record.  
     * - Updates the attendance log with the time-out.  
     * - Calculates worked hours and determines overtime or undertime.  
     * - Inserts corresponding overtime/undertime records into `AttendanceLogException`.  
     * - Updates compensatory leave balance in `EmployeeLeaveBalance`.  
     * - Inserts a leave transaction record in `LeaveRecord`.  
     * 
     * @async
     * @function handleTimeOut
     * @param {*} req - Express request object, expects a valid session with `req.session.user`.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response:
     * - `{ status: true, message: string, result: { time_out: Date, worked_hours: number } }` if successful  
     * - `{ status: false, error: string }` if no active time-in record or a database error occurs
     * @throws {Error} When overtime/undertime records or leave balance updates fail.
     * @author Rod
     * @lastupdated September 29, 2025
     */
    static handleTimeOut = async (req, res) => {
        const { id: employee_id } = req.session.user;
        const time_out = new Date();
        const conn = await pool.getConnection();

        try{
            await conn.beginTransaction();

            /* Check today’s attendance */
            const today_status = await AttendanceLog.fetchTodayStatus(
                employee_id, 
                conn
            );

            if(!today_status.status || !today_status.result.is_timed_in){
                await conn.rollback();
                return res.json({
                    status: false,
                    error: "No active time-in record found for today."
                });
            } 

            const log_id = today_status.result.log_id;
            const time_in = today_status.result.time_in;

            /* Update attendance log */
            const update_data = await AttendanceLog.updateTimeOut( 
                time_out, 
                log_id, 
                conn 
            );

            if(!update_data.status){
                await conn.rollback();
                return res.json(update_data);
            } 
            
            /* Calculate worked hours */
            const worked_hours = calculateWorkedHours(new Date(time_in), time_out);
            const { undertime } = calculateOvertimeUndertime(worked_hours); 
            const start = new Date(time_in);
        
            let message = ""; 

            if(isOvertimeThresholdExceeded(worked_hours)){
                const overtime = worked_hours - REGULAR_WORK_HOURS;
                
                /*  Insert overtime record */
                const overtime_record = await AttendanceLogException.insertLogException(
                    log_id,                                       
                    overtime,                           
                    IS_OVERTIME.TRUE,                             
                    new Date(start.getFullYear() + 1, start.getMonth(), start.getDate()), 
                    conn                                         
                );

                if(!overtime_record.status){
                    throw new Error("Failed to insert overtime record: " + overtime_record.error);
                }

                /* Update comp leave */
                const comp_leave_update = await EmployeeLeaveBalance.updateCompLeaveOnOvertime(
                    employee_id, 
                    LEAVE_TYPE_IDS.COMPENSATORY_LEAVE, 
                    overtime, 
                    conn
                );

                if(!comp_leave_update.status){
                    throw new Error("Failed to update compensatory leave balance (overtime): " + comp_leave_update.error);
                }

                /* Insert leave record (earn) */
                const leave_record_insert = await LeaveRecord.insertLeaveRecord(
                    [{
                        leave_application_id: null,
                        leave_transaction_type_id: LEAVE_TRANSACTION_TYPE.EARN,
                        leave_type_time_unit_id: TIME_UNIT.HOUR,
                        attendance_log_exception_id: overtime_record.result.log_exception_id,
                        quantity: overtime,
                        date: new Date()
                    }],
                    conn
                );

                if(!leave_record_insert.status){
                    throw new Error("Failed to insert leave record (earn): " + leave_record_insert.error);
                }

                message = "Overtime recorded and compensatory leave updated successfully";
            } 
            else if(undertime > 0){
                /* Insert undertime record */
                const undertime_record = await AttendanceLogException.insertLogException(
                    log_id,         
                    undertime,
                    IS_OVERTIME.FALSE, 
                    null,            
                    conn
                );

                if(!undertime_record.status){
                    throw new Error("Failed to insert undertime record: " + undertime_record.error);
                }

                /* Update comp leave */
                const comp_leave_update = await EmployeeLeaveBalance.updateCompLeaveOnUndertime(
                    employee_id, 
                    LEAVE_TYPE_IDS.COMPENSATORY_LEAVE, 
                    undertime, 
                    conn
                );

                if(!comp_leave_update.status){
                    throw new Error("Failed to update compensatory leave balance (undertime): " + comp_leave_update.error);
                } 

                /* Insert leave record (use) */
                const leave_record_insert = await LeaveRecord.insertLeaveRecord(
                    [{
                        leave_application_id: null,
                        leave_transaction_type_id: LEAVE_TRANSACTION_TYPE.DEDUCT,
                        leave_type_time_unit_id: TIME_UNIT.HOUR,
                        attendance_log_exception_id: undertime_record.result.log_exception_id,
                        quantity: undertime,
                        date: new Date()
                    }],
                    conn
                );

                if(!leave_record_insert.status){
                    throw new Error("Failed to insert leave record (deduct): " + leave_record_insert.error);
                }
                
                message = "Undertime recorded and compensatory leave updated successfully";
            }
            else{
                message = "Time-out recorded. Worked hours are exactly 8, no overtime or undertime.";
            }
            
            await conn.commit();
            conn.release();
        
            return res.json({
                status: true,
                message,
                result: { time_out, worked_hours }
            });

        } 
        catch(error){
            await conn.rollback();
            conn.release();
            return res.json({ status: false, error: error.message });
        }
    };


    /**
     * Controller: Fetch Attendance by Month
     * Fetches all attendance logs of all employees for a given month.
     * 
     * @async
     * @function fetchAttendanceByMonth
     * @param {*} req - Express request object, expects `year` and `month` in params.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object[] }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static fetchAttendanceByMonth = async (req, res) => {
        const { year, month } = req.params;

        try{
            const monthly_attendance = await AttendanceLog.fetchLogsByMonth(year, month);

            if(monthly_attendance.status){
                return res.json({ success: true, result: monthly_attendance.result });
            }
            else{
                return res.json({ success: false, error: monthly_attendance.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };

    /**
     * Controller: Fetch Today’s Attendance Status
     * Fetches the current day’s attendance status for the logged-in employee.
     * 
     * @async
     * @function fetchTodayAttendanceStatus
     * @param {*} req - Express request object, expects a valid session with `req.session.user`.
     * @param {*} res - Express response object.
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static fetchTodayAttendanceStatus = async (req, res) => {
        const { id } = req.session.user;

        try{
            const today_attendance = await AttendanceLog.fetchTodayStatus(id);

            if(today_attendance.status){
                return res.json({ success: true, result: today_attendance.result });
            }
            else{
                return res.json({ success: false, error: today_attendance.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    };
}

export default AttendanceLogs;
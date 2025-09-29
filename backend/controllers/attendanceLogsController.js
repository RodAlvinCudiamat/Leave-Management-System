import AttendanceLog from "../models/attendanceLogModel.js";
import AttendanceLogException from "../models/attendanceLogExceptionModel.js";
import EmployeeLeaveBalance from "../models/employeeLeaveBalanceModel.js";
import LeaveRecord from "../models/leaveTransactionModel.js";
import { IS_OVERTIME, LEAVE_TRANSACTION_TYPE, TIME_UNIT, REGULAR_WORK_HOURS,LEAVE_TYPE_IDS, MILLISECONDS_PER_HOUR } from "../config/constants.js";
import { pool } from "../models/db.js";

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
export const handleTimeIn = async (req, res) => {
    const { id: employee_id } = req.session.user; 
    const time_in = new Date();

    try{
        const timed_in = await AttendanceLog.insertAttendaceLog({ employee_id, time_in });

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
        return res.status(500).json({ status: false, error: error.message });
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
 * @lastupdated September 25, 2025
 */
export const handleTimeOut = async (req, res) => {
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

        if(!today_status.status || !today_status.result.isTimedIn){
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
        const start = new Date(time_in);
        const end = new Date(time_out);
        const raw_hours = (end - start) / MILLISECONDS_PER_HOUR;
        const worked_hours = Math.round(raw_hours * 100) / 100;
        const overtime_threshold = REGULAR_WORK_HOURS + (20 / 60);      
    
        let message = ""; 

        if(worked_hours > overtime_threshold){
            const overtime_hours = worked_hours - REGULAR_WORK_HOURS;

            /*  Insert overtime record */
            const overtime_record = await AttendanceLogException.insertLogException(
                log_id,                                       
                overtime_hours,                           
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
                overtime_hours, 
                conn);

            if(!comp_leave_update.status){
                throw new Error("Failed to update compensatory leave balance (overtime): " + comp_leave_update.error);
            }

            /* Insert leave record (earn) */
            const leave_record_insert = await LeaveRecord.insertLeaveRecord(
                null,                
                LEAVE_TRANSACTION_TYPE.EARN, 
                TIME_UNIT.HOUR,              
                overtime_record.result.log_exception_id,                     
                overtime_hours,           
                conn                        
            );

            if(!leave_record_insert.status){
                throw new Error("Failed to insert leave record (earn): " + leave_record_insert.error);
            }

            message = "Overtime recorded and compensatory leave updated successfully";
        } 
        else if(worked_hours < REGULAR_WORK_HOURS){
            const undertime_hours = REGULAR_WORK_HOURS - worked_hours;

            /* Insert undertime record */
            const undertime_record = await AttendanceLogException.insertLogException(
                log_id,         
                undertime_hours,
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
                undertime_hours, 
                conn
            );

            if(!comp_leave_update.status){
                throw new Error("Failed to update compensatory leave balance (undertime): " + comp_leave_update.error);
            } 

            /* Insert leave record (use) */
            const leave_record_insert = await LeaveRecord.insertLeaveRecord( null,
                LEAVE_TRANSACTION_TYPE.DEDUCT,
                TIME_UNIT.HOUR,
                undertime_record.result.log_exception_id,
                undertime_hours, 
                new Date(),
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
        return res.status(500).json({ status: false, error: error.message });
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
export const fetchAttendanceByMonth = async (req, res) => {
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
export const fetchTodayAttendanceStatus = async (req, res) => {
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
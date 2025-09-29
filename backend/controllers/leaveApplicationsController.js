import LeaveApplication from "../models/leaveApplicationModel.js";
import EmployeeLeaveBalance from "../models/employeeLeaveBalanceModel.js";
import LeaveType from "../models/leaveTypeModel.js";   
import { validateLeaveDates } from "../helpers/leaveDateRules.js";
import { MILLISECONDS_PER_DAY } from "../config/constants.js";

/**
 * Controller: Create a new leave application
 * Validates notice period, checks leave balance, and creates a leave application.
 * 
 * @async
 * @function insertLeaveApplication
 * @param {*} req - Express request object, expects leave application data in `req.body`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const insertLeaveApplication = async (req, res) => {
    try {
        const { employee_id, leave_type_id, start_date, end_date, reason } = req.body;
        const today = new Date();

        /* Fetch leave type details, including notice_days */
        const leave_type_result = await LeaveType.fetchLeaveTypeById(leave_type_id); 

        if(!leave_type_result.status){
            return res.json({ status: false, error: "Failed to fetch leave type" });
        } 
        else{
            const leave_type = leave_type_result.result;
            const notice_days = leave_type.notice_days || 0;   
            const start = new Date(start_date); 

            /* Leave date validations */
            const date_validation = validateLeaveDates(leave_type, start_date, end_date, today);
            if (!date_validation.status) {
                return res.json(date_validation);
            }

            /* Overlap check */
            const overlap = await LeaveApplication.hasOverlappingLeave(employee_id, leave_type_id, start_date, end_date);
            
            if(overlap.status && overlap.result){
                return res.json({
                    status: false,
                    error: "You already have an application that overlaps with the selected dates."
                });
            } 
            else if(!overlap.status){
                return res.json(overlap);
            }

            /* Enforce notice_days if defined */
            if(notice_days > 0){
                const diff_time = start - today;
                const diff_days = Math.ceil(diff_time / MILLISECONDS_PER_DAY);

                if(diff_days < notice_days){
                    return res.json({
                        status: false,
                        error: `${leave_type.name} must be filed at least ${notice_days} day(s) before the intended start date.`
                    });
                } 
                else{
                    /* Enough notice → continue to balance check */
                    const total_days = Math.ceil(
                        (new Date(end_date) - new Date(start_date)) / MILLISECONDS_PER_DAY + 1
                    );

                    const balance_result = await EmployeeLeaveBalance.fetchTotalBalanceByLeaveType(employee_id, leave_type_id);

                    if(!balance_result.status){
                        return res.json(balance_result);
                    } 
                    else if(balance_result.result < total_days){
                        return res.json({
                            status: false,
                            error: `Insufficient leave balance. Available: ${balance_result.result} days, required: ${total_days} days`
                        });
                    } 
                    else{ 
                        /* Enough balance → create the application */
                        const create_application = await LeaveApplication.insertLeaveApplication({
                            employee_id,
                            leave_type_id,
                            start_date,
                            end_date,
                            reason
                        });
                        return res.json(create_application);
                    }
                }
            } 
            else{
                /* No notice_days required → proceed to balance check */
                const total_days = Math.ceil(
                    (new Date(end_date) - new Date(start_date)) / MILLISECONDS_PER_DAY + 1
                );

                const balance_result = await EmployeeLeaveBalance.fetchTotalBalanceByLeaveType(employee_id, leave_type_id);

                if(!balance_result.status){
                    return res.json(balance_result);
                } 
                else if(balance_result.result < total_days){
                    return res.json({
                        status: false,
                        error: `Insufficient leave balance. Available: ${balance_result.result} days, required: ${total_days} days`
                    });
                } 
                else{
                    /* Enough balance → create the application */
                    const create_application = await LeaveApplication.insertLeaveApplication({
                        employee_id,
                        leave_type_id,
                        start_date,
                        end_date,
                        reason
                    });
                    return res.json(create_application);
                }
            }
        }
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }
};


/**
 * Controller: Fetch leave application by ID
 * Fetches detailed information about a specific leave application.
 * 
 * @async
 * @function fetchLeaveApplicationById
 * @param {*} req - Express request object, expects `id` in `req.params`. 
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchLeaveApplicationById = async (req, res) => {
    try{
        const { id } = req.params;
        const leave_application = await LeaveApplication.fetchLeaveApplicationById(id);

        if(leave_application.status){
            return res.json({ success: true, result: leave_application.result });
        }
        else{
            return res.json({ success: false, error: leave_application.error });
        }
    }
    catch(error){
        return res.json({ status: false, error: error.message });
    }
};

/**
 * Controller: Fetch leave applications by employee ID
 * Fetches all leave applications submitted by a specific employee.
 * 
 * @async
 * @function fetchLeaveApplicationByEmployeeId
 * @param {*} req - Express request object, expects `employee_id` in `req.params`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchLeaveApplicationByEmployeeId = async (req, res) => {
    try{
        const { employee_id } = req.params;
        const employee_leave_applications = await LeaveApplication.fetchLeaveApplicationByEmployeeId(employee_id);    

        if(employee_leave_applications.status){
            return res.json({ success: true, result: employee_leave_applications.result });
        }
        else{
            return res.json({ success: false, error: employee_leave_applications.error });
        }
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }
};

/**
 * Controller: Fetch all leave applications
 * Fetches all leave applications from the database.
 * 
 * @async
 * @function fetchAllLeaveApplications
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchAllLeaveApplications = async (req, res) => {
    try{
        const all_leave_applications = await LeaveApplication.fetchAllLeaveApplications();

        if(all_leave_applications.status){
            return res.json({ success: true, result: all_leave_applications.result });
        }
        else{
            return res.json({ success: false, error: all_leave_applications.error });
        }
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }
};

/**
 * Controller: Update leave application status
 * Updates the status of a specific leave application.
 * 
 * @async
 * @function updateLeaveApplication
 * @param {*} req - Express request object, expects `id` in `req.params`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs 
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const updateLeaveApplication = async (req, res) => {
    try{
        const { id } = req.params;

        const update_leave_application = await LeaveApplication.updateLeaveApplicationStatus(id);

        if(update_leave_application.status){
            return res.json({ success: true, result: update_leave_application.result });
        }
        else{
            return res.json({ success: false, error: update_leave_application.error });
        }

    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }
}


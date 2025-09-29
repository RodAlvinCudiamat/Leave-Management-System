import LeaveType from "../models/leaveTypeModel.js";

/**
 * Controller: Fetch all leave types
 * Fetches all leave types from the database.
 * 
 * @async
 * @function fetchAllLeaveTypes
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const fetchAllLeaveTypes = async (req, res) => {
    try{
        const leave_types_data = await LeaveType.fetchAllLeaveTypes(); 

        if(leave_types_data.status){
            return res.json({ status: true, result: leave_types_data.result });
        }
        else{
            return res.json({ status: true, result: [] }); 
        }
    } 
    catch(err){
        return res.json({ status: false, error: err.message });
    }
};


/**
 * Controller: Fetch a leave type by ID
 * Fetches a single leave type based on its ID.
 * 
 * @async
 * @function fetchLeaveTypeById
 * @param {*} req - Express request object, expects `id` in `req.params`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs\
 * @author Rod
 * @lastupdated September 25, 2025
 * 
 */
export const fetchLeaveTypeById = async (req, res) => {
    try{
        const { id } = req.params;

        const leave_type_data = await LeaveType.fetchLeaveTypeById(id);

        if(leave_type_data.status){
            return res.json({ success: true, result: leave_type_data.result });
        } 
        else{
            return res.json({ success: false, error: leave_type_data.error });
        }
    } 
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};

/**
 * Controller: Update a leave type by ID
 * Updates the details of an existing leave type.
 * 
 * @async
 * @function updateLeaveType
 * @param {*} req - Express request object, expects `id` in `req.params` and updated data in `req.body`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, message: string, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const updateLeaveType = async (req, res) => {
    try{
        const { id } = req.params;
        const data = req.body;

        const update_leave_type = await LeaveType.updateLeaveTypeById(data, id);

        if(update_leave_type.status){
            return res.json({ success: true, message: "Leave type updated successfully", result: update_leave_type.result });
        } 
        else{
            return res.json({ success: false, error: update_leave_type.error });
        }
    } 
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};

/**
 * Controller: Delete (soft delete) a leave type by ID
 * Marks a leave type as inactive (soft delete) rather than removing it permanently.
 * 
 * @async
 * @function deleteLeaveType
 * @param {*} req - Express request object, expects `id` in `req.params`.
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, message: string, result: object }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 25, 2025
 */
export const deleteLeaveType = async (req, res) => {
    try{
        const { id } = req.params;

        const remove_leave_type = await LeaveType.deleteLeaveTypeById(id);

        if(remove_leave_type.status){
            return res.json({ success: true, message: "Leave type deleted successfully", result: remove_leave_type.result });
        } 
        else{
            return res.json({ success: false, error: remove_leave_type.error });
        }
    } 
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};
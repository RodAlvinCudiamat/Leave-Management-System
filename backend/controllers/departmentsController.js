import Department from "../models/departmentModel.js";

/**
 * Controller: Fetch All Departments
 * Fetches all departments from the database.
 * 
 * @async
 * @function fetchAllDepartments
 * @param {*} req - Express request object.
 * @param {*} res - Express response object.
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const fetchAllDepartments = async (req, res) => {
    try{
        const departments_data = await Department.fetchAllDepartments();

        if(departments_data.status){
            return res.json({ success: true, result: departments_data.result });
        }
        else{
            return res.json({ success: false, error: departments_data.error });
        }
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }   
}
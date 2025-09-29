import Role from "../models/roleModel.js";
/**
 * Controller: Fetch all positions
 * Fetches all positions from the database.
 * 
 * @async
 * @function fetchAllPositions
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, result: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const fetchAllRoles = async (req, res) => {
    try {
        const fetch_roles = await Role.fetchAllRoles();

        if(fetch_roles.status){
            return res.json({ success: true, result: fetch_roles.result });
        }
        else{
            return res.json({ success: false, error: fetch_roles.error });
        }
    } 
    catch(error){
        return res.json({ status: false, error: error.message });
    }
}
import Role from "../models/Role.js";

class Roles {
    /**
     * Controller: Fetch all roles
     * Fetches all roles from the database.
     * 
     * @async
     * @function fetchAllPositions
     * @param {*} req - Express request object
     * @param {*} res - Express response object
     * @returns {Promise<void>} Sends a JSON response with either:
     * - `{ success: true, result: object[] }` if successful
     * - `{ success: false, error: string }` if an error occurs
     * @author Rod
     * @lastupdated September 28, 2025
     */
    static fetchAllRoles = async (req, res) => {
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
}

export default Roles;
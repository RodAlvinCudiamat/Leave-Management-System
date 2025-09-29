import { pool } from './db.js';

/**
 * @class Role
 * Role model for managing employee roles.
 */
class Role {
    /**
     * Constructor for the Role class.
     *
     * @constructor
     * @param {number|null} id - The unique ID of the role (null for new records).
     * @param {string|null} title - The title of the role.
     */
    constructor(id = null, title = null) {
        this.id = id;
        this.title = title;
    }
    /**
     * Fetch all roles.
     * Retrieves all role records from the database.
     * 
     * @static
     * @async
     * @method fetchAllRoles
     * @returns {Promise<{status: boolean, result: object[], error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllRoles() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [roles] = await pool.query(`
                SELECT * 
                FROM employee_roles`);

            if(roles.length){
                response_data.status = true;
                response_data.result = roles;
            }
            else{
                response_data.error = 'No roles found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }   
}

export default Role;
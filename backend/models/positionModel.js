import { pool } from './db.js';

/**
 * @class Position
 * Position model for managing employee positions.
 */
class Position {
    /**
     * Constructor for the Position class.
     *
     * @constructor
     * @param {number|null} id - The unique ID of the position (null for new records).
     * @param {string|null} title - The title of the position.
     */
    constructor(id = null, title = null) {
        this.id = id;
        this.title = title;
    }

    /**
     * Fetch all positions.
     * Retrieves all position records from the database.
     * 
     * @static
     * @async
     * @method fetchAllPositions
     * @returns {Promise<{status: boolean, result: object[], error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchAllPositions() {
        const response_data = { status: false, result: null, error: null };

        try{
            const [positions] = await pool.query(`
                SELECT * 
                FROM employee_positions`);

            if(positions.length){
                response_data.status = true;
                response_data.result = positions;
            }
            else{
                response_data.error = 'No positions found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }   
}

export default Position;
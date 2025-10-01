import Position from "../models/Position.js";

class Positions {
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
    static fetchAllPositions = async (req, res) => {
        try {
            const fetch_positions = await Position.fetchAllPositions();

            if(fetch_positions.status){
                return res.json({ success: true, result: fetch_positions.result });
            }
            else{
                return res.json({ success: false, error: fetch_positions.error });
            }
        } 
        catch(error){
            return res.json({ status: false, error: error.message });
        }
    }
}

export default Positions;
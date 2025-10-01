import { pool } from './db.js';

/**
 * @class Holiday
 * Holiday model for managing holidays.
 */
class Holiday {
    /**
     * Fetch all holidays between two dates.
     * 
     * @static
     * @async
     * @method fetchHolidays
     * @param {string} start_date - Start date (YYYY-MM-DD)
     * @param {string} end_date - End date (YYYY-MM-DD)
     * @returns {Promise<{status: boolean, result: string[]|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchHolidays(start_date, end_date){
        const response_data = { status: false, result: null, error: null };

        try{
            const [holidays] = await pool.query(`SELECT dateFROM holidays WHERE date BETWEEN ? AND ?`, [start_date, end_date]);
            
            /* Format dates to YYYY-MM-DD */
            const holiday_dates = holidays.map(holiday => holiday.holiday_date.toISOString().split('T')[0]);

            if(holiday_dates.length){
                response_data.status = true;
                response_data.result = holiday_dates;
            }
            else{
                response_data.error = "No holidays found";
            }
        } 
        catch(error){
            /* Return any error encountered */
            response_data.error = error.message;
        }

        return response_data;
    };
}

export default Holiday;
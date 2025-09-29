import { pool } from './db.js';

/**
 * @class Department
 * Department model for managing employee departments.
 */
class Department {
    /**
     * Constructor for the Department class.
     *
     * @constructor
     * @param {number|null} id - The unique ID of the department (null for new records).
     * @param {string|null} name - The name of the department.
     */
    constructor(id = null, name = null) {
        this.id = id;
        this.name = name;
    }

    /**
     * Fetch all departments.
     * Retrieves all department records from the database.
     * 
     * @static
     * @async
     * @method fetchAllDepartments
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async fetchAllDepartments() {
        const response_data = { status: false, result: null, error: null };

        try{
            /* Query all rows from the departments table */
            const [departments] = await pool.query(`
                SELECT * 
                FROM employee_departments
            `);

            if(departments.length){
                response_data.status = true;
                response_data.result = departments; 
            }
            else{
                response_data.error = 'No departments found';
            }
        }
        catch(error){
            /* Return any error encountered */
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default Department;
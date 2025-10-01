import { pool } from './db.js';
import { IS_ACTIVE } from '../config/constants.js';

/**
 * @class Employee
 * Employee model for managing employee records. 
 */ 
class Employee {
    /**
     * Static factory for adding a new employee in one call.
     * 
     * @static
     * @async   
     * @method insertEmployee
     * @param {object} param - Object containing employee details.
     * @param {number} department_id - The department ID of the employee.
     * @param {number} position_id - The position ID of the employee.
     * @param {number} role_id - The role ID of the employee.
     * @param {string} first_name - The first name of the employee.
     * @param {string} last_name - The last name of the employee.
     * @param {string} gender - The gender of the employee.
     * @param {string} email - The email address of the employee.
     * @param {string} password - The password of the employee.
     * @param {Date} hired_at - The hire date of the employee.
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 28, 2025
     */
    static async insertEmployee({department_id, position_id, role_id, first_name, last_name, gender, email, password, hired_at, is_active = IS_ACTIVE.TRUE }, conn) {
        const response_data = { status: false, result: null, error: null };

        try{
            // Check if employee exists
            const existing_employee = await Employee.findEmployeeByEmail(email);

            if(existing_employee.status){
                response_data.error = "Employee already exists with this email";
            } 
            else{
                const [insert_employee] = await conn.query(
                    `
                    INSERT INTO employees 
                        (employee_department_id, employee_position_id, employee_role_id, first_name, last_name, gender, email, password, is_active, hired_at, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                    `, [ department_id, position_id, role_id, first_name, last_name, gender, email, password, is_active, hired_at ]
                );

                if(insert_employee.affectedRows){
                    response_data.status = true;
                    response_data.result = { employee_id: insert_employee.insertId };
                } 
                else{
                    response_data.error = "Failed to insert employee";
                }
            }
        } 
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }

    /**
     * Find an employee by their email address.
     * 
     * @static
     * @async
     * @method findEmployeeByEmail
     * @param {string} email - Employee email address
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async findEmployeeByEmail(email){
        const response_data = { status: false, result: null, error: null };

        try{
            /* Clean and normalize the email */
            const clean_email = email.trim().toLowerCase();

            /* Query for a user with the given email */
            const [employees] = await pool.query(`SELECT * FROM employees WHERE LOWER(email) = ? LIMIT 1`, [clean_email]);

            /* If found, return the user */
            if(employees.length){
                response_data.status = true;
                response_data.result = employees[0];
            } 
            else{
                response_data.error = "EMPLOYEE_NOT_FOUND";
            }
        } 
        catch(err){
            response_data.error = err.message;
        }

        return response_data;
    };

    /**
     * Fetch all employees from the database.
     * 
     * @static
     * @async
     * @method fetchAllEmployees
     * @returns {Promise<{status: boolean, result: Array<object>|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 25, 2025
     */
    static async fetchAllEmployees(){
        const response_data = { status: false, result: null, error: null }

        try{
            const [employees] = await pool.query(`
                SELECT employee.id AS employee_id,
                    employee.employee_role_id,
                    employee.first_name,
                    employee.last_name,
                    employee.gender,
                    employee.email,
                    employee.hired_at,
                    employee.employee_department_id,
                    employee.employee_position_id,
                    department.name,
                    position.title AS position,
                    role.title
                FROM employees AS employee
                LEFT JOIN employee_departments AS department ON employee.employee_department_id = department.id
                LEFT JOIN employee_positions AS position ON employee.employee_position_id = position.id
                LEFT JOIN employee_roles AS role ON employee.employee_role_id = role.id
                WHERE employee.is_active = ?
                ORDER BY employee.created_at DESC`
            , [IS_ACTIVE.TRUE]);

            if(employees.length){
                response_data.status = true;
                response_data.result = employees;
            }
            else{
                response_data.error = 'No employees found';
            }
        }
        catch(error){
            /* Return any error encountered */
            response_data.error = error.message;
        }
        
        return response_data;
    }

    /**
     * Fetch a single employee by their ID.
     * 
     * @static
     * @async
     * @method fetchEmployeeById
     * @param {number} id - Employee ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async fetchEmployeeById(id){
        const response_data = { status: false, result: null, error: null }

        try{
            const [employee] = await pool.query(`
                SELECT employee.id AS employee_id,
                    role.title AS role,
                    employee.employee_department_id,
                    employee.employee_position_id,
                    employee.first_name,
                    employee.last_name,
                    employee.gender,
                    employee.email,
                    position.title,
                    employee.hired_at,
                    department.name,
                    position.title
                FROM employees AS employee
                LEFT JOIN employee_departments AS department ON employee.employee_department_id = department.id
                LEFT JOIN employee_positions AS position ON employee.employee_position_id = position.id
                LEFT JOIN employee_roles AS role ON employee.employee_role_id = role.id
                WHERE employee.id = ?
                LIMIT 1
                `, [id]
            );

            if(employee.length){
                response_data.status = true;
                response_data.result = employee[0];
            }
            else{
                response_data.error = 'No employee found';
            }
        }
        catch(error){
            response_data.error = error.message;
        }
        
        return response_data;
    }

    /**
     * Soft delete an employee by setting is_active to false.
     * 
     * @static
     * @async
     * @method softDeleteEmployee
     * @param {number} id - Employee ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async softDeleteEmployee(id){
        const response_data = { status: false, result: null, error: null }

        try{
            const [delete_employee] = await pool.query(`
                UPDATE employees 
                SET is_active = ?
                WHERE id = ? 
                LIMIT 1
                `, [IS_ACTIVE.FALSE, id]
            );

            if(delete_employee.affectedRows){
                response_data.status = true;
                response_data.result = delete_employee;
            }
            else{
                response_data.error = 'Failed to delete employee';
            }
        }
        catch(error){
            response_data.error = error.message;
        }
        
        return response_data;
    }

    /**
     * Update an existing employee by their ID.
     * 
     * @static
     * @async
     * @method updateEmployeeById
     * @param {object} employee_data - Object containing fields to update.
     * @param {number} id - Employee ID
     * @returns {Promise<{status: boolean, result: object|null, error: string|null}>}
     * @author Rod
     * @lastupdated September 26, 2025
     */
    static async updateEmployeeById(employee_data, id){
        const response_data = { status: false, result: null, error: null };

        try{
            const fields = [];
            const values = [];

            /* Build dynamic update query based on provided fields */
            for(const key in employee_data){
                if(employee_data[key] !== undefined && employee_data[key] !== null && employee_data[key] !== ""){
                    fields.push(`\`${key}\` = ?`);
                    values.push(employee_data[key]);
                }
            }

            if(fields.length === 0){
                response_data.error = "No fields to update";
            } 
            else{
                /* Add id as last parameter for WHERE */
                values.push(id);

                const sql = `
                    UPDATE employees
                    SET ${fields.join(", ")}, updated_at = NOW()
                    WHERE id = ? LIMIT 1
                `;

                const [update_employee] = await pool.query(sql, values);

                if(update_employee.affectedRows){
                    response_data.status = true;
                    response_data.result = update_employee;
                } 
                else{
                    response_data.error = "Employee not found or no changes made";
                }
            }
        }
        catch(error){
            response_data.error = error.message;
        }

        return response_data;
    }
}

export default Employee;
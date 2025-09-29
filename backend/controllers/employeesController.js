import bcrypt from "bcrypt";
import Employee from "../models/employeeModel.js";
import { grantRegularLeaveTypes } from "../services/leaveServices.js";

/**
 * Controller: Fetch all active employees
 * Fetches all employees from the database
 * 
 * @async
 * @function fetchAllEmployees
 * @param {*} req - Express request object
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, employees: object[] }` if successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const fetchAllEmployees = async (req, res) => {
    try{
        const employees_data = await Employee.fetchAllEmployees();

        if(employees_data.status){
            return res.json({ success: true, employees: employees_data.result });
        }
        else{
            return res.json({ success: false, error: employees_data.error });
        }
    }
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};

/**
 * Controller: Login employee
 * Validates email & password, creates session if successful
 * 
 * @async
 * @function handleLogin
 * @param {*} req - Express request object containing { email, password } in body
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, message: string, user: object }` if login is successful
 * - `{ success: false, error: string }` if login fails
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const handleLogin = async (req, res) => {
    const { email, password } = req.body

    try{
        if(!email || !password){
            return res.json({ success: false, error: 'Both email and password are required.' })
        }
        else{
            const user_data = await Employee.findEmployeeByEmail(email);

            if(!user_data.status || !user_data.result){
                return res.json({ success: false, error: 'No user found with that email.' })
            }
            else{
                const user = user_data.result
                const is_match = await bcrypt.compare(password, user.password)

                if(!is_match){
                    return res.json({ success: false, error: 'Incorrect password.' })
                }
                else{
                    /* Create session */
                    req.session.user = {
                        id: user.id,
                        role_id: user.employee_role_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        gender: user.gender,
                        email: user.email
                    }

                return res.json({ success: true, message: 'Login successful.', user: req.session.user })  
                }
            }
        }
    }
    catch(err){
        return res.json({ success: false, error: 'Login failed: ' + err.message })
    }
}

/**
 * Controller: Create a new employee
 * Validates input, hashes password, inserts into DB, and grants all regular leave types.
 * 
 * @async
 * @function insertEmployee
 * @param {*} req - Express request object containing employee details
 * @param {*} res - Express response object
 * @returns {Promise<void>} - Sends a JSON response with either:
 * - `{ success: true, message: string, employee_id: number }` if creation is successful
 * - `{ success: false, error: string }` if validation or insertion fails
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const insertEmployee = async (req, res) => {
    try{
        const { department_id, position_id, role_id, first_name, last_name, gender, email, password, hire_date } = req.body;

        /* Validate all fields */
        if(!department_id || !position_id || !role_id || !first_name || !last_name || !gender || !email || !password || !hire_date){
            return res.json({ success: false, error: "All fields" });
        }

        /* Hash password */
        const password_hash = await bcrypt.hash(password, 10);

        /* Create employee */
        const created_employee = await Employee.insertEmployee({
            department_id,
            position_id,
            role_id,
            first_name,
            last_name,
            gender,
            email,
            password: password_hash,
            hired_at: hire_date
        });

        if(!created_employee.status){
            return res.json({ success: false, error: created_employee.error });
        }

        const employee_id = created_employee.result.insertId;

        /* Grant all active leave types */
        const grant_leaves = await grantRegularLeaveTypes(employee_id);
        if(!grant_leaves.status){
            return res.json({
                success: true,
                message: "Employee created, but failed to grant leave types: " + grant_leaves.error
            });
        }

        return res.json({
            success: true,
            message: "Employee created successfully and leave types granted",
            employee_id
        });
    } 
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};

/**
 * Controller: Soft delete employee
 * Marks employee as inactive instead of removing from DB
 * 
 * @async
 * @function softDeleteEmployees
 * @param {*} req - Express request object, expects employee ID in params
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, message: string }` if deletion is successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const softDeleteEmployees = async (req, res) => {
    try{
        const { id } = req.params;
        const removed_employee = await Employee.softDeleteEmployee(id);

        if(removed_employee.status){
            return res.json({ success: true, message: "Employees removed successfully" });
        }
        else{
            return res.json({ success: false, error: removed_employee.error });
        }
    }
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};

/**
 * Controller: Update employee by ID
 * Updates employee details, hashes password if provided
 * 
 * @async
 * @function updateEmployee
 * @param {*} req - Express request object, expects employee ID in params
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, message: string }` if update is successful
 * - `{ success: false, error: string }` if validation or update fails
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const updateEmployee = async (req, res) => {
    try{
        const { id } = req.params;
        const allowed_fields = [ "employee_department_id", "employee_position_id", "employee_role_id", "first_name", "last_name", "email", "hired_at", "password" ];

       /* Build update object dynamically (only include changed fields) */
        const employee_data = {};
        for (const field of allowed_fields) {
            if( req.body[field] !== undefined && req.body[field] !== null && String(req.body[field]).trim() !== "" ){
                employee_data[field] = req.body[field];
            }
        }

        /* If password is included, hash it before saving */
        if(employee_data.password){
            const salt = await bcrypt.genSalt(10);

            employee_data.password = await bcrypt.hash(employee_data.password, salt);
        }

        const updated_employee = await Employee.updateEmployeeById(employee_data, id);

        if(updated_employee.status){
            return res.json({ success: true, message: "Employee updated successfully" });
        } 
        else{
            return res.json({ success: false, error: updated_employee.error });
        }
    } 
    catch(err){
        return res.json({ success: false, error: err.message });
    }
};

/**
 * Controller: Logout employee
 * Destroys session
 * 
 * @async
 * @function logOut
 * @param {*} req - Express request object with active session
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, message: string }` if logout is successful
 * - `{ success: false, error: string }` if an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const logOut = async (req, res) => {
    try{
        req.session.destroy();
        return res.json({ success: true, message: "Logout successful." });
    }
    catch(err){
        return res.json({ success: false, error: err.message });
    }
}

/**
 * Controller: Fetch employee by ID
 * Returns employee details
 * 
 * @async
 * @function fetchEmployeeById
 * @param {*} req - Express request object, expects employee ID in params
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, employee: object }` if found
 * - `{ success: false, error: string }` if not found or an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const fetchEmployeeById = async (req, res) => {
    try{
        const { id } = req.params;
        const employee_data = await Employee.fetchEmployeeById(id);

        if(employee_data.status){
            return res.json({ success: true, employee: employee_data.result });
        }
        else{
            return res.json({ success: false, error: employee_data.error });
        }
    }
    catch(err){
        return res.status(500).json({ success: false, error: err.message });
    }
}

/**
 * Controller: Fetch currently logged-in employee
 * Checks session and returns employee details
 * 
 * @async
 * @function fetchCurrentEmployee
 * @param {*} req - Express request object with session
 * @param {*} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with either:
 * - `{ success: true, employee: object }` if logged in
 * - `{ success: false, error: string }` if not logged in or an error occurs
 * @author Rod
 * @lastupdated September 26, 2025
 */
export const fetchCurrentEmployee = async (req, res) => {
    try{
        if(!req.session.user){
            return res.json({ success: false, error: "Not logged in." });
        }
        else{
            return res.json({ success: true, employee: req.session.user });
        }
    }
    catch(err){
        return res.json({ success: false, error: err.message });
    }
}
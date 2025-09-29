import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function UpdateEmployee() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        employee_department_id: "",
        employee_position_id: "",
        role: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        hired_at: ""
    });

    const [originalForm, setOriginalForm] = useState({});
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchEmployee = async () => {
            try{
                const res = await api.get(`/employees/${id}`);
                const emp = res.data.employee || {};

                if (emp.hired_at) {
                    emp.hired_at = emp.hired_at.split("T")[0]; 
                }

                setForm(emp);
                setOriginalForm(emp);
            } 
            catch(err){
                setMessage(" Failed to load employee: " + err.message);
            }
        };

        const fetchOptions = async () => {
            try{
                const deptRes = await api.get("/departments");
                const posRes = await api.get("/positions");
                setDepartments(deptRes.data.result || []);
                setPositions(posRes.data.result || []);
            } 
            catch(err){
                console.error("Error loading dropdowns", err);
            }
        };

        fetchEmployee();
        fetchOptions();
    }, [id]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const changedData = {};
        Object.keys(form).forEach((key) => {
            if (form[key] !== originalForm[key]) {
                if (key === "password" && !form[key]) return;
                changedData[key] = form[key];
            }
        });


        if (Object.keys(changedData).length === 0) {
            setMessage(" No changes made");
            return;
        }

        try{
            await api.put(`/employees/update/${id}`, changedData);

            setMessage(" Employee updated successfully");
        } 
        catch(err){
            setMessage(err.response?.data?.error || " Update failed");
        }
    };

    // === Styles (same theme as AddEmployee) ===
    const container = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "450px",
        backgroundColor: "#121a14",
        color: "#e0f2e9",
        padding: "1rem"
    };

    const card = {
        background: "#1e2a23",
        padding: "2rem",
        borderRadius: "10px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.4)"
    };

    const input = {
        width: "100%",
        padding: "0.75rem",
        marginBottom: "1rem",
        border: "1px solid #2d3f35",
        borderRadius: "6px",
        background: "#121a14",
        color: "#e0f2e9",
        fontSize: "1rem"
    };

    const label = {
        marginBottom: "0.3rem",
        fontWeight: "bold",
        color: "#9ae6b4",
        display: "block"
    };

    const button = {
        width: "100%",
        padding: "0.8rem",
        border: "none",
        borderRadius: "6px",
        background: "#2ecc71",
        color: "#fff",
        fontWeight: "bold",
        fontSize: "1rem",
        cursor: "pointer",
        marginTop: "0.5rem"
    };

    const backButton = {
        ...button,
        background: "#2d3f35",
        marginTop: "0.8rem"
    };

    return (
        <div style={container}>
            <div style={card}>
                <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Update Employee</h2>

                <form onSubmit={handleSubmit}>
                    {/* Role */}
                    <div>
                        <label style={label}>Role:</label>
                        <select
                            name="role"
                            value={form.role || ""}
                            onChange={handleChange}
                            style={input}
                        >
                            <option value="">Select role</option>
                            <option value="employee">Employee</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Department */}
                    <div>
                        <label style={label}>Department:</label>
                        <select
                            name="employee_department_id"
                            value={form.employee_department_id || ""}
                            onChange={handleChange}
                            style={input}
                        >
                            <option value="">Select department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Position */}
                    <div>
                        <label style={label}>Position:</label>
                        <select
                            name="employee_position_id"
                            value={form.employee_position_id || ""}
                            onChange={handleChange}
                            style={input}
                        >
                            <option value="">Select position</option>
                            {positions.map((pos) => (
                                <option key={pos.id} value={pos.id}>
                                    {pos.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Other Fields */}
                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={form.first_name || ""}
                        onChange={handleChange}
                        style={input}
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={form.last_name || ""}
                        onChange={handleChange}
                        style={input}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email || ""}
                        onChange={handleChange}
                        style={input}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password (leave blank if unchanged)"
                        value={form.password || ""}
                        onChange={handleChange}
                        style={input}
                    />
                    <div>
                        <label style={label}>Hire Date:</label>
                        <input
                            type="date"
                            name="hired_at"
                            value={form.hired_at || ""}
                            onChange={handleChange}
                            style={input}
                        />
                    </div>

                    <button type="submit" style={button}>
                        Update Employee
                    </button>
                </form>

                {message && (
                    <p style={{ textAlign: "center", marginTop: "1rem" }}>{message}</p>
                )}

                <button onClick={() => navigate("/employees")} style={backButton}>
                    Back to Employee List
                </button>
            </div>
        </div>
    );
}

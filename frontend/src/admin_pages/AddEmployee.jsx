import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function AddEmployee() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        department_id: "",
        position_id: "",
        role_id: "",
        first_name: "",
        last_name: "",
        gender: "",
        email: "",
        password: "",
        hire_date: ""
    });

    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [roles, setRole] = useState([]);
    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            await api.post("/employees/create", form);
            setMessage("✅ Employee created successfully");
            setForm({
                department_id: "",
                position_id: "",
                role_id: "",
                first_name: "",
                last_name: "",
                gender: "",
                email: "",
                password: "",
                hire_date: ""
            });
        } 
        catch(err){
            setMessage(err.response?.data?.error || "❌ Creation failed");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try{

                const deptRes = await api.get("/departments");
                const posRes = await api.get("/positions");
                const roleRes = await api.get("/roles");
                setDepartments(deptRes.data.result || []);
                setPositions(posRes.data.result || []);
                setRole(roleRes.data.result || []);
            } 
            catch(err){
                console.error("Error loading options", err);
            }
        };
        fetchData();
    }, []);

    const container = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "500px",
        backgroundColor: "#121a14",
        color: "#e0f2e9"
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
                <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Add Employee</h2>

                <form onSubmit={handleSubmit}>
                    <div>
                        <label style={label}>Role:</label>
                        <select
                            name="role_id"
                            value={form.role_id}
                            onChange={handleChange}
                            style={input}
                        >
                            <option value="">Select role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={label}>Department:</label>
                        <select
                            name="department_id"
                            value={form.department_id}
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

                    <div>
                        <label style={label}>Position:</label>
                        <select
                            name="position_id"
                            value={form.position_id}
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

                    <div>
                        <label style={label}>Gender:</label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            style={input}
                        >
                            <option value="">Select gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>


                    <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={form.first_name}
                        onChange={handleChange}
                        style={input}
                    />
                    <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={form.last_name}
                        onChange={handleChange}
                        style={input}
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        style={input}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        style={input}
                    />
                    <div>
                        <label style={label}>Hire Date:</label>
                        <input
                            type="date"
                            name="hire_date"
                            value={form.hire_date}
                            onChange={handleChange}
                            style={input}
                        />
                    </div>

                    <button type="submit" style={button}>
                        Create Employee
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

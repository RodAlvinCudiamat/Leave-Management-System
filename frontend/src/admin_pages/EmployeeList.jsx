import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const fetchEmployees = async () => {
        try{
            const res = await api.get("/employees");
            
            setEmployees(res.data.employees);
        } 
        catch(err){
            setMessage(err.response?.data?.error || "Failed to load employees");
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this employee?")) return;

        try{
            await api.delete(`/employees/delete/${id}`);
            setMessage("Employee deleted successfully");
            fetchEmployees();
        }
        catch(err){
            setMessage(err.response?.data?.error || "Delete failed");
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filtered = employees.filter((emp) =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        emp.email.toLowerCase().includes(search.toLowerCase()) ||
        (emp.department_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (emp.position_title || "").toLowerCase().includes(search.toLowerCase()) ||
        (emp.role || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Employee List</h2>
            <Link to="/employee/create">
                <button>Add Employee</button>
            </Link>
            <p>{message}</p>
            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>
            <br />
            <br />

            <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    marginBottom: "1rem",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    border: "1px solid #2d3f35",
                    background: "#26382e",
                    color: "#e0f2e9",
                    width: "50%"
                }}
            />

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Role</th>
                        <th style={thStyle}>First Name</th>
                        <th style={thStyle}>Last Name</th>
                        <th style={thStyle}>Gender</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Department</th>
                        <th style={thStyle}>Position</th>
                        <th style={thStyle}>Hired At</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.length > 0 ? (
                        filtered.map((emp, i) => (
                        <tr key={emp.employee_id}  style={trStyle(i)}>
                            <td style={thTdStyle}>{emp.employee_id}</td>
                            <td style={thTdStyle}>{emp.title}</td>
                            <td style={thTdStyle}>{emp.first_name}</td>
                            <td style={thTdStyle}>{emp.last_name}</td>
                            <td style={thTdStyle}>{emp.gender}</td>
                            <td style={thTdStyle}>{emp.email}</td>
                            <td style={thTdStyle}>{emp.name || "N/A"}</td>
                            <td style={thTdStyle}>{emp.position || "N/A"}</td>
                            <td style={thTdStyle}>{new Date(emp.hired_at).toLocaleDateString()}</td>
                            <td style={thTdStyle}>
                                <Link to={`/leave-balances/${emp.employee_id}`}>
                                    <button style={{ background: "#0c5c2fff", color: "white" }}>
                                        View Leave Balance
                                    </button>
                                </Link>
                                &nbsp;
                                <Link to={`/employee/update/${emp.employee_id}`}>
                                    <button>Update</button>
                                </Link>
                                &nbsp;
                                <button
                                    style={{ color: "white", background: "#9c0d18ff" }}
                                    onClick={() => handleDelete(emp.employee_id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={thTdStyle}>
                                No employees found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    background: "#1e2a23",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    color: "#e0f2e9"
};

const thTdStyle = {
    border: "1px solid #2d3f35",  // subtle green-gray borders
    padding: "0.75rem",
    textAlign: "left"
};

const thStyle = {
    ...thTdStyle,
    background: "#2d3f35",
    fontWeight: "bold",
    color: "#9ae6b4"
};

const trStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? "#1e2a23" : "#26382e"
});
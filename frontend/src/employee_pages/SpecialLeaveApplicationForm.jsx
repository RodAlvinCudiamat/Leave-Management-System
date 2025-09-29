import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateLeaveApplication() {
    const [formData, setFormData] = useState({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason_text: ""
    });
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [employee, setEmployee] = useState(null);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // fetch employee + leave types on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // get logged-in employee
                const resUser = await api.get("/employees/me");
                const emp = resUser.data.employee;
                if (!emp) {
                    setMessage("Not logged in.");
                    return;
                }
                setEmployee(emp);

                // get leave types
                const res = await api.get(`/employee_leave_balances/balance/ungranted/${emp.id}/${new Date().getFullYear()}`);
                if (res.data.success) {
                    let types = res.data.result || [];

                    // filter based on gender
                    if (emp.gender?.toLowerCase() === "male") {
                        types = types.filter(
                            (t) =>
                                t.leave_type_name !==
                                    "10-Day VAWC (Violence Against Women and Children) Leave" &&
                                t.leave_type_name !== "Maternity Leave" &&
                                t.leave_type_name !== "Special Leave Benefits for Women"
                        );
                    } else if (emp.gender?.toLowerCase() === "female") {
                        types = types.filter((t) => t.leave_type_name !== "Paternity Leave");
                    }

                    setLeaveTypes(types);
                } else {
                    setMessage(res.data.error || "Failed to load leave types.");
                }
            } catch (err) {
                setMessage(err.response?.data?.error || "Server error.");
            }
        };

        fetchData();
    }, []);

    // handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            if (!employee?.id) {
                setMessage("Not logged in.");
                return;
            }

            const payload = {
                employee_id: employee.id,
                leave_type_id: formData.leave_type_id,
                leave_application_status_id: 1 // submitted
            };

            const res = await api.post("/leave_grant_requests/create", payload);

            if (res.data.success) {
                setMessage("Leave application submitted successfully!");
                setFormData({
                    leave_type_id: ""
                });
            } else {
                setMessage(res.data.error || "Failed to create leave application.");
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Server error.");
        }
    };

    return (
        <div style={container}>
            <div style={card}>
                <h2 style={{ marginBottom: "1rem", color: "#9ae6b4" }}>File Special Leave</h2>
                <form onSubmit={handleSubmit}>
                    <label style={label}>Leave Type:</label>
                    <select
                        name="leave_type_id"
                        value={formData.leave_type_id}
                        onChange={handleChange}
                        required
                        style={input}
                    >
                        <option value="">-- Select Leave Type --</option>
                        {leaveTypes.map((type) => (
                            <option key={type.leave_type_id} value={type.leave_type_id}>
                                {type.leave_type_name}
                            </option>
                        ))}
                    </select>

                    <button type="submit" style={button}>
                        Submit Application
                    </button>
                </form>
                <button onClick={() => navigate("/employee-dashboard")} style={backButton}>
                    Back to Dashboard
                </button>

                {message && <p style={{ marginTop: "1rem", color: "#f5f5f5" }}>{message}</p>}
            </div>
        </div>
    );
}

// === Styles (same theme as AddEmployee) ===
const container = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    width: "500px",
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

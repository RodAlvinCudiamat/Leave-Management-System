import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateLeaveApplication() {
    const [formData, setFormData] = useState({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        reason: ""
    });
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveTypes = async () => {
            try {
                const res = await api.get("/employee_leave_balances/balance/me");

                if (res.data.success) {
                    // Only include leave types with remaining balance > 0
                    const availableLeaveTypes = (res.data.result || []).filter(
                        (type) => parseFloat(type.remaining_credit) > 0
                    );

                    setLeaveTypes(availableLeaveTypes);
                } else {
                    setMessage(res.data.error || "Failed to load leave types.");
                }
            } catch (err) {
                setMessage(err.response?.data?.error || "Server error.");
            }
        };

        fetchLeaveTypes();
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

        try{
            // Get logged-in employee from session
            const resUser = await api.get("/employees/me");
            const employee_id = resUser.data.employee?.id;

            if(!employee_id){
                setMessage("Not logged in.");
                return;
            }

            const payload = {
                employee_id,
                leave_type_id: formData.leave_type_id,
                start_date: formData.start_date,
                end_date: formData.end_date,
                reason: formData.reason
            };

            const res = await api.post("/leave_applications/application/create", payload);

            if(res.data.status){
                setMessage("Leave application submitted successfully!");
                setFormData({
                    leave_type_id: "",
                    start_date: "",
                    end_date: "",
                    reason: ""
                });
            } 
            else{
                setMessage(res.data.error || "Failed to create leave application.");
            }
        } 
        catch(err){
            setMessage(err.response?.data?.error || "Server error.");
        }
    };

    return (
        <div style={container}>
            <div style={card}>
                <h2 style={{ marginBottom: "1rem", color: "#9ae6b4" }}>File Leave</h2>
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

                    <label style={label}>Start Date:</label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        required
                        style={input}
                    />

                    <label style={label}>End Date:</label>
                    <input
                        type="date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        required
                        style={input}
                    />

                    <label style={label}>Reason:</label>
                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        required
                        style={{ ...input, height: "100px", resize: "vertical" }}
                    />

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

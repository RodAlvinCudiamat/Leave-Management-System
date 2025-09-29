import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeDashboard() {
    const [balances, setBalances] = useState([]);
    const [employeeName, setEmployeeName] = useState("");
    const [message, setMessage] = useState("");
    const [isTimedIn, setIsTimedIn] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveBalances = async () => {
            try{
                const res = await api.get("/employee_leave_balances/balance/me");
                
                if(res.data.success){
                    setBalances(res.data.result);

                    if(res.data.result.length > 0){
                        setEmployeeName(res.data.result[0].employee_name);
                    }
                    else{
                        setEmployeeName(" ");
                    }
                }
                else{
                    setMessage(res.data.error || "No leave balance found");
                }
            } 
            catch(err){
                setMessage(err.response?.data?.error || "Failed to load leave balances");
            }
        };

        const fetchAttendanceStatus = async () => {
            try {
                const res = await api.get("/attendance_logs/attendance/status/me");

                if(res.data.success){
                    setIsTimedIn(res.data.result.isTimedIn);
                }
                else{
                    console.error("Failed to load attendance status:", res.data.error);
                }
            } 
            catch(err){
                console.error("Failed to fetch attendance status:", err);
            }
        };

        fetchLeaveBalances();
        fetchAttendanceStatus();
    }, []);

    const handleToggleAttendance = async () => {
        try {
            if(!isTimedIn){
                const res = await api.post("/attendance_logs/time-in");

                if(res.data.status){
                    setIsTimedIn(true);
                    setAttendanceMessage("Successfully timed in at " + res.data.result.time_in);
                }
                else{
                    setAttendanceMessage(res.data.error || "Time in failed.");
                }
            }
            else{
                const res = await api.post("/attendance_logs/time-out");

                if(res.data.status){
                    setIsTimedIn(false);
                    setAttendanceMessage("Successfully timed out at " + res.data.result.time_out);
                }
                else{
                    setAttendanceMessage(res.data.error || "Time out failed.");
                }
            }
        } 
        catch(err){
            setAttendanceMessage(err.response?.data?.error || "Attendance update failed.");
        }
    };

    const handleLogout = async () => {
        try{
            await api.post("/employees/logout"); 
            navigate("/");
        } 
        catch(err){
            console.error("Logout failed:", err);
            alert("Logout failed. Please try again.");
        }
    };

    return (
        <div style={container}>
            <header style={header}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem", color: "#e0f2e9" }}>Leave Management System</h1>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#9ae6b4" }}>Employee Dashboard</h2>
                </div>
                <button onClick={handleLogout} style={logoutBtn}>Logout</button>
            </header>

            {employeeName && <h3 style={{ color: "#9ae6b4" }}>Welcome, {employeeName}</h3>}
            {message && <p style={{ color: "#f5f5f5" }}>{message}</p>}

            <div style={{ margin: "1rem 0" }}>
                <button onClick={handleToggleAttendance} style={attendanceBtn(isTimedIn)}>
                    {isTimedIn ? "Time Out" : "Time In"}
                </button>
                {attendanceMessage && <p style={{ marginTop: "0.5rem" }}>{attendanceMessage}</p>}
            </div>

            <nav style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/regular-leave-application")} style={navBtn}>File Leave</button>
                <button onClick={() => navigate("/special-leave-application")} style={navBtn}>Request Special Leave</button>
                <button onClick={() => navigate("/employee-leave-applications")} style={navBtn}>My Applications</button>
            </nav>

            {balances.length > 0 && (
                <section>
                    <h3 style={{ marginBottom: "1rem", color: "#9ae6b4" }}>Leave Balances</h3>
                    <div style={{ overflowX: "auto" }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Year</th>
                                    <th style={thStyle}>Leave Type</th>
                                    <th style={thStyle}>Starting</th>
                                    <th style={thStyle}>Earned</th>
                                    <th style={thStyle}>Used</th>
                                    <th style={thStyle}>Deducted</th>
                                    <th style={thStyle}>Carry In</th>
                                    <th style={thStyle}>Remaining</th>
                                    <th style={thStyle}>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balances.map((bal, i) => (
                                    <tr key={bal.leave_balance_id} style={trStyle(i)}>
                                        <td style={thTdStyle}>{bal.year}</td>
                                        <td style={thTdStyle}>{bal.leave_type_name}</td>
                                        <td style={thTdStyle}>{bal.starting_credit}</td>
                                        <td style={thTdStyle}>{bal.earned}</td>
                                        <td style={thTdStyle}>{bal.used}</td>
                                        <td style={thTdStyle}>{bal.deducted}</td>
                                        <td style={thTdStyle}>{bal.carry_in}</td>
                                        <td style={thTdStyle}>{bal.remaining_credit}</td>
                                        <td style={thTdStyle}>{bal.leave_type_time_unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
        </div>
    );
}

// === Styles (same theme as Admin Dashboard) ===
const container = {
    padding: "2rem",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#121a14",
    color: "#e0f2e9",
    minHeight: "100vh"
};

const header = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem"
};

const logoutBtn = {
    background: "#9c0d18ff",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    cursor: "pointer"
};

const navBtn = {
    background: "#1b4332",
    color: "#e0f2e9",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    cursor: "pointer"
};

const attendanceBtn = (isTimedIn) => ({
    background: isTimedIn ? "#9c0d18ff" : "#0c5c2fff",
    color: "white",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    cursor: "pointer"
});

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
    border: "1px solid #2d3f35",
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

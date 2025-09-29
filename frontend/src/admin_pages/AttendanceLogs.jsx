import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function AttendanceByMonth() {
    const [logs, setLogs] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Fetch logs
    const fetchLogs = async () => {
        try{
            const resUser = await api.get("/employees/me");
            const employee_id = resUser.data.employee?.id;

            if(!employee_id){
                setMessage("Not logged in.");
                return;
            }

             const res = await api.get(`/attendance_logs/${year}/${month}`);

                if(res.data.success){
                    setLogs(res.data.result || []);
                    setMessage(""); // clear message if logs exist
                } 
                else{
                    setLogs([]); 
                    setMessage(res.data.error || "No logs found for this month.");
                }
        } 
        catch(err){
            setLogs([]);
            setMessage(err.response?.data?.error || "Server error.");
        }
    };

    useEffect(() => {
        fetchLogs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month]);

    return (
        <div style={container}>
            <div style={card}>
                <button
                    onClick={() => navigate("/dashboard")}
                    style={backButton}
                >
                    Back to Dashboard
                </button>
                <h2 style={{ marginBottom: "1rem", color: "#9ae6b4" }}>
                    Attendance Logs
                </h2>

                {/* Filters */}
                <div style={{ marginBottom: "1rem" }}>
                    <label style={label}>Year:</label>
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        style={{ ...input, width: "120px" }}
                    />

                    <select
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        style={{ ...input, width: "150px" }}
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString("default", {
                                    month: "long",
                                })}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Table */}
                {logs.length > 0 ? (
                    <table style={table}>
                        <thead>
                            <tr>
                                <th style={th}>Employee</th>
                                <th style={th}>Time In</th>
                                <th style={th}>Time Out</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td style={td}>{log.employee_name}</td>
                                    <td style={td}>
                                        {new Date(log.time_in).toLocaleString()}
                                    </td>
                                    <td style={td}>
                                        {log.time_out
                                            ? new Date(log.time_out).toLocaleString()
                                            : "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ marginTop: "1rem", textAlign: "center" }}>
                        <p style={{ color: "#f5f5f5" }}>
                            {message || "No attendance logs for this month."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

// === Styles ===
const container = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#121a14",
    color: "#e0f2e9",
    padding: "1rem",
};

const card = {
    background: "#1e2a23",
    padding: "2rem",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
};

const input = {
    padding: "0.5rem",
    border: "1px solid #2d3f35",
    borderRadius: "6px",
    background: "#121a14",
    color: "#e0f2e9",
    fontSize: "1rem",
    marginRight: "0.5rem",
};

const label = {
    marginRight: "0.5rem",
    fontWeight: "bold",
    color: "#9ae6b4",
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
    marginTop: "0.5rem",
};

const backButton = {
    ...button,
    background: "#2d3f35",
    marginBottom: "1rem",
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
    background: "#121a14",
};

const th = {
    borderBottom: "2px solid #2d3f35",
    textAlign: "left",
    padding: "0.75rem",
    color: "#9ae6b4",
};

const td = {
    borderBottom: "1px solid #2d3f35",
    padding: "0.75rem",
    color: "#e0f2e9",
};

import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LeaveRecords() {
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveRecords = async () => {
            try{
                const res = await api.get("/leave_records");
                
                if(res.data.success){
                    setLeaveRecords(res.data.result);
                    setMessage(res.data.result.length === 0 ? "No leave records found." : "");
                } 
                else{
                    setMessage(res.data.error || "Failed to fetch leave records.");
                }
            } 
            catch(err){
                setMessage(err.response?.data?.error || "Server error.");
            } 
            finally{
                setLoading(false);
            }
        };

        fetchLeaveRecords();
    }, []);

    if (loading) return <p>Loading leave records...</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Leave Transactions</h2>
            {message && <p>{message}</p>}
            <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
            <br /><br />

            {leaveRecords.length > 0 && (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Employee</th>
                            <th style={thStyle}>Leave / Log Type</th> 
                            <th style={thStyle}>Record Type</th>
                            <th style={thStyle}>Quantity</th>
                            <th style={thStyle}>Unit</th>
                            <th style={thStyle}>Transaction Date</th>
                        </tr>
                    </thead>
                        <tbody>
                        {leaveRecords.map((record, i) => {
                            const logTypeLabel =
                            record.log_type === 1 ? "Overtime" :
                            record.log_type === 0 ? "Undertime" : "";

                            const combinedType = [logTypeLabel, record.leave_type]
                            .filter(Boolean)       // remove blanks/nulls
                            .join(" - ");          // join with dash

                            return (
                            <tr key={record.id} style={trStyle(i)}>
                                <td style={thTdStyle}>{record.employee_name}</td>
                                <td style={thTdStyle}>{combinedType}</td>
                                <td style={thTdStyle}>{record.transaction_type}</td>
                                <td style={thTdStyle}>{record.quantity}</td>
                                <td style={thTdStyle}>{record.time_unit}</td>
                                <td style={thTdStyle}>
                                    {record.date ? new Date(record.date).toLocaleDateString() : ""}
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                </table>
            )}
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
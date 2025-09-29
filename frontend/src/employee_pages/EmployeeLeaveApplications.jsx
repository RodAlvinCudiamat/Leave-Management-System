import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function EmployeeLeaveApplications() {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [selectedDays, setSelectedDays] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showDays, setShowDays] = useState(false);
    const [sortOrder, setSortOrder] = useState("asc"); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveApplications = async () => {
            try{
                const resUser = await api.get("/employees/me");
                const employee_id = resUser.data.employee?.id;

                if(!employee_id){
                    setMessage("Not logged in.");
                    setLoading(false);
                    return;
                }

                const res = await api.get(`/leave_applications/application/employee/${employee_id}`);

                if(res.data.success){
                    setLeaveApplications(res.data.result);
                    setMessage("");
                } 
                else{
                    setMessage(res.data.error || "No leave applications found.");
                }
            } 
            catch(err){
                setMessage(err.response?.data?.error || "Server error.");
            } 
            finally{
                setLoading(false);
            }
        };

        fetchLeaveApplications();
    }, []);

    const handleViewDays = async (application_id) => {
        try{
            const res = await api.get(`/leave_application_days/${application_id}/days`);
            
            if(res.data.success){
                setSelectedDays(res.data.result);
                setShowDays(true);
            } 
            else{
                setMessage(res.data.error || "No leave days found.");
            }
        }
        catch(err){
            setMessage(err.response?.data?.error || "Server error.");
        }
    };

    const handleSortByStatus = () => {
        const order = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(order);

        const sorted = [...leaveApplications].sort((a, b) => {
            if (a.status < b.status) return order === "asc" ? -1 : 1;
            if (a.status > b.status) return order === "asc" ? 1 : -1;
            return 0;
        });

        setLeaveApplications(sorted);
    };

    const handleCancelDay = async (day_id, application_id) => {
        if (!window.confirm("Are you sure you want to cancel this leave day?")) return;

        try {
            const res = await api.put(`/leave_application_days/update/${application_id}`, {
                day_ids: [day_id],   // backend accepts array of day ids
                status: "cancelled"
            });

            if (res.data.status) {
                // Update local state for days
                setSelectedDays((prev) =>
                    prev.map((day) =>
                        day.id === day_id ? { ...day, name: "cancelled" } : day
                    )
                );

                setMessage(`Leave day ${day_id} for application ${application_id} cancelled successfully.`);
            } else {
                setMessage(res.data.error || "Failed to cancel leave day.");
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Server error.");
        }
    };


    if (loading) return <p>Loading leave applications...</p>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>My Leave Applications</h2>
            {message && <p>{message}</p>}
            <button onClick={() => navigate("/employee-dashboard")}>Back to Dashboard</button>
            <br /><br />
            {leaveApplications.length > 0 && (
                <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Leave Type</th>
                                <th style={{ ...thStyle, cursor: "pointer" }} onClick={handleSortByStatus}>
                                    Status {sortOrder === "asc" ? "▲" : "▼"}
                                </th>
                                <th style={thStyle}>Reason</th>
                                <th style={thStyle}>Start Date</th>
                                <th style={thStyle}>End Date</th>
                                <th style={thStyle}>Filed At</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaveApplications.map((app, i) => (
                                <tr key={app.application_id} style={trStyle(i)}>
                                    <td style={thTdStyle}>{app.name}</td>
                                    <td style={thTdStyle}>{app.status ? "Pending" : "Done"}</td>
                                    <td style={thTdStyle}>{app.reason}</td>
                                    <td style={thTdStyle}>{new Date(app.start_date).toLocaleDateString()}</td>
                                    <td style={thTdStyle}>{new Date(app.end_date).toLocaleDateString()}</td>
                                    <td style={thTdStyle}>{new Date(app.filed_at).toLocaleDateString()}</td>
                                    <th style={thStyle}>
                                        <button
                                            onClick={() => handleViewDays(app.application_id)}
                                            style={actionBtn}
                                        >
                                            View
                                        </button>
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
            )}

            {showDays && selectedDays.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                    <h3>Leave Application Days</h3>
                    <button onClick={() => setShowDays(false)}>Close</button>
                    <table border="1" cellPadding="8" cellSpacing="0" style={{ width: "100%", marginTop: "1rem" }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Day Fraction</th>
                                <th>Is Workday</th>
                                <th>Is Holiday</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedDays.map((day) => (
                                <tr key={day.id}>
                                    <td>{new Date(day.date).toLocaleDateString()}</td>
                                    <td>{day.name}</td>
                                    <td>{day.day_in_fraction}</td>
                                    <td>{day.is_workday ? "Yes" : "No"}</td>
                                    <td>{day.is_holiday ? "Yes" : "No"}</td>
                                    <td>
                                        {day.name === "submitted" && day.is_workday && !day.is_holiday && (
                                            <button
                                                onClick={() => handleCancelDay(day.id, day.application_id)}
                                                style={{
                                                    ...actionBtn,
                                                    background: "#e63946"
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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

const actionBtn = {
    background: "#457b9d",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#e0f2e9"
};
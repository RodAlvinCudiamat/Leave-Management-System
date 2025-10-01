import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LeaveApplicationsPage() {
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [sortOrder, setSortOrder] = useState("asc"); 
    const [selectedDays, setSelectedDays] = useState([]);
    const [showDays, setShowDays] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeaveApplications = async () => {
            try{
                const res = await api.get(`/leave_applications/applications/employees`); 

                if(res.data.success){
                    if(res.data.result.length > 0){
                        setLeaveApplications(res.data.result);
                        setMessage("");
                    } 
                    else{
                        setLeaveApplications([]);
                        setMessage("No leave applications found.");
                    }
                } 
                else{
                    setLeaveApplications([]);
                    setMessage(res.data.error || "Failed to fetch leave applications.");
                }
            }
            catch(err){
                setLeaveApplications([]);
                setMessage(err.response?.data?.error || "Server error.");
            } 
            finally{
                setLoading(false);
            }
        };

        fetchLeaveApplications();
    }, []);

    // handle sorting
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
                setMessage(err.response?.data?.error || "Server error3.");
            }
        };

    if(loading){
        return <p>Loading leave applications...</p>;
    } 
    else{
        return (
            <div style={{ padding: "2rem" }}>
                <h2>All Leave Applications</h2>
                {message && <p>{message}</p>}
                <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                <br /><br />

                {leaveApplications.length > 0 ? (
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Employee</th>
                                <th style={thStyle}>Department</th>
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
                                    <td style={thTdStyle}>{app.employee_name}</td>
                                    <td style={thTdStyle}>{app.deptname}</td>
                                    <td style={thTdStyle}>{app.name}</td>
                                    <td style={thTdStyle}>{app.is_pending ? "Pending" : "Done"}</td>
                                    <td style={thTdStyle}>{app.reason}</td>
                                    <td style={thTdStyle}>{new Date(app.start_date).toLocaleDateString()}</td>
                                    <td style={thTdStyle}>{new Date(app.end_date).toLocaleDateString()}</td>
                                    <td style={thTdStyle}>{new Date(app.filed_at).toLocaleDateString()}</td>
                                    <th style={thStyle}>
                                        <button onClick={() => handleViewDays(app.application_id)} style={actionBtn}>View</button>{" "}
                                    </th>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                
                ) : (
                    <p>No applications to display.</p>
                )}
                {showDays && selectedDays.length > 0 && (
                <section style={{ marginTop: "2rem" }}>
                    <h3 style={{ color: "#9ae6b4" }}>Leave Application Days</h3>
                    <button onClick={() => setShowDays(false)} style={{ marginBottom: "1rem", ...actionBtn }}>Close</button>
                    <div style={{ overflowX: "auto" }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Date</th>
                                    <th style={thStyle}>Day Fraction</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Is Workday</th>
                                    <th style={thStyle}>Is Holiday</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedDays.map((day) => (
                                    <tr key={day.id}>
                                        <td style={thTdStyle}>{new Date(day.date).toLocaleDateString()}</td>
                                        <td style={thTdStyle}>{day.day_in_fraction}</td>
                                        <td style={thTdStyle}>{day.name}</td>
                                        <td style={thTdStyle}>{day.is_workday ? "Yes" : "No"}</td>
                                        <td style={thTdStyle}>{day.is_holiday ? "Yes" : "No"}</td>
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
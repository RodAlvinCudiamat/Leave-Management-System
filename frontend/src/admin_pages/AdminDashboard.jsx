import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
    const navigate = useNavigate();
    const [leaveApplications, setLeaveApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [grantMessage, setGrantMessage] = useState("");
    const [selectedDays, setSelectedDays] = useState([]);
    const [showDays, setShowDays] = useState(false);
    const [grantRequests, setGrantRequests] = useState([]);
    const [applicationDays, setApplicationDays] = useState({});



    useEffect(() => {
        fetchSubmittedLeaves();
        fetchLeaveGrantRequests();
        const checkAuth = async () => {
            try{
                const res = await api.get("/employees/me");
                if(!res.data?.employee){
                    navigate("/"); // redirect to login
                }
            }
            catch {
                navigate("/"); 
            }
        };

    checkAuth();
    }, [navigate]);

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

    const fetchSubmittedLeaves = async () => {
        try{
            const res = await api.get("/leave_applications/applications");
            if(res.data.success){
                const submittedApplications = res.data.result.filter(
                    (app) => app.is_pending === 1
                );
                setLeaveApplications(submittedApplications);
            } 
            else{
                setMessage(res.data.error || "Failed to fetch leave applications.");
            }
        } 
        catch(err){
            setMessage(err.response?.data?.error || "Server error1.");
        } 
        finally{
            setLoading(false);
        }
    };

    const fetchLeaveGrantRequests = async () => {
        setLoading(true);
        setGrantMessage("");

        try {
            const res = await api.get("/leave_grant_requests");
            if(res.data.success){
                const pendingRequests = res.data.result.filter(req => req.leave_application_status_name === "submitted");
                setGrantRequests(pendingRequests);           
            } 
            else{
                setGrantMessage(res.data.error || "Failed to fetch leave grant requests.");
            }
        } 
        catch(err){
            setGrantMessage(err.response?.data?.error || "Server error.");
        } 
        finally {
            setLoading(false);
        }
    }

    const handleUpdateStatus = async (day_id, status) => {
        try {
            let approver_id = null;
            if (status.toLowerCase() === "approved") {
                const resUser = await api.get("/employees/me");
                approver_id = resUser.data.employee?.id || null;
            }

            const res = await api.put(`/leave_application_days/update/${day_id}`, {
                day_ids: [day_id],
                status: status,
                approver_id: approver_id
            });

            if (res.data.status) {
                setSelectedDays(prev =>
                    prev.map(day =>
                        day.id === day_id ? { ...day, name: status } : day
                    )
                );

                if (status.toLowerCase() === "approved") {
                    setMessage(`Leave day ${day_id} has been approved.`);
                } else if (status.toLowerCase() === "rejected") {
                    setMessage(`Leave day ${day_id} has been rejected.`);
                } else {
                    setMessage(res.data.result || `Leave day ${day_id} updated to ${status}`);
                }
            } else {
                setMessage(res.data.error || `Failed to ${status} leave day.`);
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Server error.");
        }
    };


    const handleUpdatePending = async (application_id) => {
        try {
            const res = await api.put(`/leave_applications/application/update/${application_id}`, {
                is_pending: 0
            });

            if (res.data.success) {
                setMessage(`Application ${application_id} marked as done.`);    
                await fetchSubmittedLeaves(); // refresh the list
            } else {
                setMessage(res.data.error || "Failed to update application.");
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Server error while updating application.");
        }
    };

    const handleGrantStatus = async (leave_grant_request_id, status) => {
        try {
            const res = await api.put(`/leave_grant_requests/update/${leave_grant_request_id}`, {
                leave_application_status_id: Number(status.toLowerCase() === "approved" ? 2 : 3)
            });


            if (res.data.success) {
                setGrantMessage(`Grant request ${leave_grant_request_id} ${status}.`);
                await fetchLeaveGrantRequests(); 
            } else {
                setGrantMessage(res.data.error || `Failed to ${status} grant request.`);
            }
        } catch (err) {
            setGrantMessage(err.response?.data?.error || "Server error while updating grant request.");
        }
    };

    const handleViewDays = async (application_id) => {
        try {
            const res = await api.get(`/leave_application_days/${application_id}/days`);
            if (res.data.success) {
                setApplicationDays(prev => ({
                    ...prev,
                    [application_id]: res.data.result
                }));
                setSelectedDays(res.data.result); // for the view section
                setShowDays(true);
            } else {
                setMessage(res.data.error || "No leave days found.");
            }
        } catch (err) {
            setMessage(err.response?.data?.error || "Server error3.");
        }
    };


    if(loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading submitted leave applications...</p>;

    return (
        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", fontFamily: "Arial, sans-serif", backgroundColor: "#121a14", color: "#e0f2e9", minHeight: "100vh" }}>
            <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "2rem", color: "#e0f2e9" }}>Leave Management System</h1>
                    <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#9ae6b4" }}>Admin Dashboard</h2>
                </div>
                <button 
                    onClick={handleLogout} 
                    style={{ background: "#9c0d18ff", color: "white", border: "none", padding: "0.6rem 1.2rem", borderRadius: "6px", cursor: "pointer" }}
                >
                    Logout
                </button>
            </header>

            <nav style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                <button onClick={() => navigate("/employees")} style={navBtn}>Employee List</button>
                <button onClick={() => navigate("/leave-types")} style={navBtn}>Leave Types</button>
                <button onClick={() => navigate("/leave-records")} style={navBtn}>Leave Records</button>
                <button onClick={() => navigate("/all-leave-applications")} style={navBtn}>All Applications</button>
                <button onClick={() => navigate("/attendance-logs")} style={navBtn}>Attendance Logs</button>
                <button onClick={() => navigate("/overtime-records")} style={navBtn}>Overtime and Undertime Records</button>
            </nav>

            <section>
                <h3 style={{ marginBottom: "1rem", color: "#9ae6b4" }}>Leave Applications for Approval</h3>
                {message && <p style={{ color: "#f5f5f5", marginBottom: "1rem" }}>{message}</p>}

                {leaveApplications.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Employee</th>
                                    <th style={thStyle}>Leave Type</th>
                                    <th style={thStyle}>Start Date</th>
                                    <th style={thStyle}>End Date</th>
                                    <th style={thStyle}>Filed At</th>
                                    <th style={thStyle}>Reason</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaveApplications.map((app, i) => {
                                    const days = applicationDays[app.application_id];
                                    const allDaysNoAction = days && days.length > 0
                                        ? days.every(day =>
                                            !day.is_workday ||
                                            day.is_holiday ||
                                            ["approved", "rejected", "cancelled"].includes(day.name.toLowerCase())
                                        )
                                        : false;

                                    return (
                                        <tr key={app.application_id} style={trStyle(i)}>
                                            <td style={thTdStyle}>{app.employee_name}</td>
                                            <td style={thTdStyle}>{app.name}</td>
                                            <td style={thTdStyle}>{new Date(app.start_date).toLocaleDateString()}</td>
                                            <td style={thTdStyle}>{new Date(app.end_date).toLocaleDateString()}</td>
                                            <td style={thTdStyle}>{new Date(app.filed_at).toLocaleDateString()}</td>
                                            <td style={thTdStyle}>{app.reason}</td>
                                            <td style={thTdStyle}>
                                                <button onClick={() => handleViewDays(app.application_id)} style={actionBtn}>View</button>{" "}
                                                {allDaysNoAction && (
                                                    <button
                                                        onClick={() => handleUpdatePending(app.application_id)}
                                                        style={{ ...actionBtn, background: "#0c5c2fff" }}
                                                    >
                                                        Done
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No leave applications to show.</p>
                )}
            </section>

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
                                    <th style={thStyle}>Actions</th>
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
                                        <td style={thTdStyle}>
                                        {day.is_workday && !day.is_holiday && day.name.toLowerCase() !== "approved" && day.name.toLowerCase() !== "rejected" && day.name.toLowerCase() !== "cancelled" ? (
                                            <>
                                            <button
                                                onClick={() => handleUpdateStatus(day.id, "approved")}
                                                style={{ ...actionBtn, background: "#0c5c2fff" }}
                                            >
                                                Approve
                                            </button>{" "}
                                            <button
                                                onClick={() => handleUpdateStatus(day.id, "rejected")}
                                                style={{ ...actionBtn, background: "#9c0d18ff" }}
                                            >
                                                Reject
                                            </button>
                                            </>
                                        ) : (
                                            <span style={{ color: "#a0a0a0" }}>N/A</span>
                                        )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
            <section>
                <h3 style={{ marginBottom: "1rem", color: "#9ae6b4" }}>Leave Grant Requests</h3>
                {grantMessage && <p style={{ color: "#f5f5f5", marginBottom: "1rem" }}>{grantMessage}</p>}

                {grantRequests.length > 0 ? (
                    <div style={{ overflowX: "auto" }}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Employee</th>
                                    <th style={thStyle}>Leave Type</th>
                                    <th style={thStyle}>Status</th>
                                    <th style={thStyle}>Requested At</th>
                                    <th style={thStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {grantRequests.map(req => (
                                    <tr key={req.leave_grant_request_id}>
                                        <td style={thTdStyle}>{req.employee_name}</td>
                                        <td style={thTdStyle}>{req.leave_type_name}</td>
                                        <td style={thTdStyle}>{req.leave_application_status_name}</td>
                                        <td style={thTdStyle}>{new Date(req.requested_at).toLocaleDateString()}</td>
                                        <td style={thTdStyle}>
                                            <button onClick={() => handleGrantStatus(req.leave_grant_request_id, "approved")} style={{ ...actionBtn, background: "#0c5c2fff" }}>Approve</button>{" "}
                                            <button onClick={() => handleGrantStatus(req.leave_grant_request_id, "rejected")} style={{ ...actionBtn, background: "#9c0d18ff" }}>Reject</button>{" "}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No leave grant requests to show.</p>
                ) 
                }
            </section>


        </div>
    );
}

const navBtn = {
    background: "#1b4332",
    color: "#e0f2e9",
    border: "none",
    padding: "0.6rem 1.2rem",
    borderRadius: "6px",
    cursor: "pointer"
};

const actionBtn = {
    background: "#457b9d",
    border: "none",
    padding: "0.4rem 0.8rem",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#e0f2e9"
};

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


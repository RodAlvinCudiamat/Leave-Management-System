import { useEffect, useState } from "react";
import { Link, useNavigate   } from "react-router-dom";
import api from "../api/axios";

export default function LeaveTypeList() {
    const [leave_types, setLeaveTypes] = useState([]);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const fetchLeaveTypes = async () => {
        try{
            const res = await api.get("/leave_types");

            setLeaveTypes(res.data.result || []);
        } 
        catch(err){
            setMessage("Failed to load leave types" + err.message);
        }
    };

    const handleDelete = async (id) => {
        if(!window.confirm("Are you sure you want to delete this leave type?")) return;

        try{
            await api.delete(`/leave_types/delete/${id}`);
            setMessage("Leave type deleted successfully");
            fetchLeaveTypes();
        } 
        catch(err){
            setMessage(err.response?.data?.error || "Delete failed");
        }
    };

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Leave Types</h2>
            <p>{message}</p>
            <button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
            </button>
            <br />
            <br />

            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Code</th>
                        <th style={thStyle}>Leave Type</th>
                        <th style={thStyle}>Datetime Unit</th>
                        <th style={thStyle}>Grant Basis</th>
                        <th style={thStyle}>Credit</th>
                        <th style={thStyle}>Notice Days</th>
                        <th style={thStyle}>Overtime Multiplier</th>
                        <th style={thStyle}>Future Filing Allowed</th>
                        <th style={thStyle}>Requires Approval</th>
                        <th style={thStyle}>Carryover Allowed</th>
                        <th style={thStyle}>Is Active</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {leave_types.length > 0 ? (
                        leave_types.map((lt, i) => (
                            <tr key={lt.id} style={trStyle(i)}>
                                <td style={thTdStyle}>{lt.id}</td>
                                <td style={thTdStyle}>{lt.code}</td>
                                <td style={thTdStyle}>{lt.leave_name}</td>
                                <td style={thTdStyle}>{lt.time_unit}</td>
                                <td style={thTdStyle}>{lt.grant_basis}</td>
                                <td style={thTdStyle}>{lt.credit}</td>
                                <td style={thTdStyle}>{lt.notice_days}</td>
                                <td style={thTdStyle}>{lt.overtime_multiplier}</td>
                                <td style={thTdStyle}>{lt.is_future_filing_allowed ? "Yes" : "No"}</td>
                                <td style={thTdStyle}>{lt.is_approval_needed ? "Yes" : "No"}</td>
                                <td style={thTdStyle}>{lt.is_carried_over ? "Yes" : "No"}</td>
                                <td style={thTdStyle}>{lt.is_active ? "Yes" : "No"}</td>
                                <td style={thTdStyle}>
                                    <Link to={`/leave-type/update/${lt.id}`}><button style={{ background: "#274c34ff"}}>Edit</button></Link>{" "}
                                    <button onClick={() => handleDelete(lt.id)} style={{ background: "#9c0d18ff"}}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="12" style={{ textAlign: "center" }}>
                                No leave types found
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
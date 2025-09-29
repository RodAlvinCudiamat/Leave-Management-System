import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function EmployeeLeaveBalance() {
    const { employee_id } = useParams();
    const navigate = useNavigate();

    const [balances, setBalances] = useState([]);
    const [employeeName, setEmployeeName] = useState("");
    const [message, setMessage] = useState("");

    const fetchLeaveBalances = async () => {
        try{
            const res = await api.get(`/employee_leave_balances/balance/${employee_id}`);

            if(res.data.success){
                setBalances(res.data.result);
                if(res.data.result.length > 0){
                    setEmployeeName(res.data.result[0].employee_name);
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

    useEffect(() => {
        fetchLeaveBalances();
    }, [employee_id]);

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Leave Balances</h2>
            {employeeName && <h3>Employee: {employeeName}</h3>}
            {message && <p>{message}</p>}

            {balances.length > 0 ? (
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>Year</th>
                            <th style={thStyle}>Leave Type</th>
                            <th style={thStyle}>Unit</th>
                            <th style={thStyle}>Opening Balance</th>
                            <th style={thStyle}>Earned</th>
                            <th style={thStyle}>Used</th>
                            <th style={thStyle}>Deducted</th>
                            <th style={thStyle}>Carry In</th>
                            <th style={thStyle}>Closing Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {balances.map((bal, i) => (
                            <tr key={bal.leave_balance_id} style={trStyle(i)}>
                                <td style={thTdStyle}>{bal.year}</td>
                                <td style={thTdStyle}>{bal.leave_type_name}</td>
                                <td style={thTdStyle}>{bal.leave_type_time_unit}</td>
                                <td style={thTdStyle}>{bal.starting_credit}</td>
                                <td style={thTdStyle}>{bal.earned}</td>
                                <td style={thTdStyle}>{bal.used}</td>
                                <td style={thTdStyle}>{bal.deducted}</td>
                                <td style={thTdStyle}>{bal.carry_in}</td>
                                <td style={thTdStyle}>{bal.remaining_credit}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No leave balances found.</p>
            )}

            <br />
            <button onClick={() => navigate("/employees")}>
                Back to Employee List
            </button>
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
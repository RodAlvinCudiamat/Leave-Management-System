import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

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

const trStyle = (index) => ({
    backgroundColor: index % 2 === 0 ? "#1e2a23" : "#26382e"
});

export default function OvertimeRecords() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();


    useEffect(() => {
        const fetchRecords = async () => {
            try{
                const res = await api.get("/attendance_log_exceptions");
                
                if(res.data.success){
                    setRecords(res.data.result);
                } 
                else{
                    setError("No overtime records found.");
                }
            } 
            catch(err){
                setError("Failed to fetch overtime records." + err.message);
            } 
            finally{
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    const filtered = records.filter((rec) =>
        `${rec.first_name ?? ""} ${rec.last_name ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );



    if(loading){
        return <p style={{ color: "#9ae6b4" }}>Loading overtime records...</p>;
    } 
    else if(error){
        return <p style={{ color: "tomato" }}>{error}</p>;
    } 
    else{
        return (
            <div style={{ padding: "2rem" }}>
                <h2 style={{ color: "#9ae6b4", marginBottom: "1rem" }}>Overtime Records</h2>
                <input
                    type="text"
                    placeholder="Search by employee..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        marginBottom: "1rem",
                        padding: "0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #2d3f35",
                        background: "#26382e",
                        color: "#e0f2e9"
                    }}
                />
                <button
                    onClick={() => navigate("/dashboard")}
                    style={backButton}
                >
                    Back to Dashboard
                </button>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Employee</th>
                            <th style={thStyle}>Hours</th>
                            <th style={thStyle}>Log Type</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Valid Until</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((rec, index) => (
                            <tr key={rec.id} style={trStyle(index)}>
                                <td style={thTdStyle}>{rec.id}</td>
                                <td style={thTdStyle}>{rec.first_name} {rec.last_name}</td>
                                <td style={thTdStyle}>{rec.hours ?? ""}</td>
                                <td style={thTdStyle}>
                                    {(() => {
                                        if (rec.is_overtime === 1) return "Overtime";
                                        if (rec.is_overtime === 0) return "Undertime";
                                        return "";
                                    })()}
                                </td>
                                <td style={thTdStyle}>{new Date(rec.date).toLocaleDateString()}</td>
                                <td style={thTdStyle}>{rec.valid_until_at ? new Date(rec.valid_until_at).toLocaleDateString() : ""}</td>
                            </tr>
                            ))
                        ) : (
                            <tr>
                            <td style={thTdStyle} colSpan="6">No matching records</td>
                            </tr>
                        )}
                    </tbody>

                </table>
            </div>
        );
    }
}

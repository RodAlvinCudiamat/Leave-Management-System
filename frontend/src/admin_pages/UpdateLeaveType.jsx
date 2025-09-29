import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function UpdateLeaveType() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        code: "",
        name: "",
        leave_type_time_unit_id: "",
        leave_type_grant_basis_id: "",
        notice_days: "",
        is_carried_over: false,
        is_future_filing_allowed: false,
        is_approval_needed: false,
        is_active: true,
    });
    const [message, setMessage] = useState("");
    const [originalForm, setOriginalForm] = useState({});
    const [units, setUnits] = useState([]);
    const [basis, setBasis] = useState([]);

    useEffect(() => {
        const fetchLeaveType = async () => {
            try {
                const res = await api.get(`/leave_types/${id}`);

                if (res.data.success) {
                    const data = res.data.result;
                    const formattedData = {
                        ...data,
                        is_carried_over: !!data.is_carried_over,
                        is_future_filing_allowed: !!data.is_future_filing_allowed,
                        is_approval_needed: !!data.is_approval_needed,
                        is_active: !!data.is_active,
                    };
                    setForm(formattedData);
                    setOriginalForm(formattedData);

                }
            } catch (err) {
                setMessage("Failed to load leave type: " + err.message);
            }
        };

        const fetchOptions = async () => {
            try {
                const unitRes = await api.get("/leave_type_time_units");
                const basisRes = await api.get("/leave_type_grant_basis");
                setUnits(unitRes.data.result || []);
                setBasis(basisRes.data.result || []);
            } catch (err) {
                setMessage("Failed to load leave type options: " + err.message);
            }
        };

        fetchOptions();
        fetchLeaveType();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const changedData = {};
            Object.keys(form).forEach((key) => {
                if (form[key] !== originalForm[key]) {
                    changedData[key] = form[key];
                }
            });

            await api.put(`/leave_types/update/${id}`, changedData);
            navigate("/leave-types");
        } catch (err) {
            setMessage(err.response?.data?.error || "Failed to update leave type");
        }
    };

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

    return (
        <div style={container}>
            <div style={card}>
                <h2 style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                    Update Leave Type
                </h2>

                <form onSubmit={handleSubmit}>
                    <label style={label}>Leave Type Code:</label>
                    <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        style={input}
                        required
                    />

                    <label style={label}>Leave Type:</label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        style={input}
                        required
                    />
                    <div>
                        <label style={label}>Datetime Unit:</label>
                        <select
                            name="leave_type_time_unit_id"
                            value={form.leave_type_time_unit_id || ""}
                            onChange={handleChange}
                            style={input}
                        >
                            <option value="">Select Unit</option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <label style={label}>Grant Basis:</label>
                    <select
                        name="leave_type_grant_basis_id"
                        value={form.leave_type_grant_basis_id || ""}
                        onChange={handleChange}
                        style={input}
                    >
                       <option value="">Select Basis</option>
                            {basis.map((base) => (
                                <option key={base.id} value={base.id}>
                                    {base.name}
                                </option>
                            ))}
                    </select>

                    <label style={label}>Default Opening Balance:</label>
                    <input
                        type="number"
                        name="default_opening_balance"
                        value={form.credit}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        style={input}
                        required
                    />

                    <label style={label}>Notice Days:</label>
                    <input
                        type="number"
                        name="notice_days"
                        value={form.notice_days}
                        onChange={handleChange}
                        min="0"
                        step="1"
                        style={input}
                    />

                    <label style={label}>Is Carry Over:</label>
                    <input
                        type="checkbox"
                        name="is_carried_over"
                        checked={form.is_carried_over}
                        onChange={handleChange}
                    />

                    <label style={label}>Is Future Filing Allowed:</label>
                    <input
                        type="checkbox"
                        name="is_future_filing_allowed"
                        checked={form.is_future_filing_allowed}
                        onChange={handleChange}
                    />

                    <label style={label}>Is Approval Needed:</label>
                    <input
                        type="checkbox"
                        name="is_approval_needed"
                        checked={form.is_approval_needed}
                        onChange={handleChange}
                    />

                    <label style={label}>Is Active:</label>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={form.is_active}
                        onChange={handleChange}
                    />


                    <button type="submit" style={button}>
                        Update Leave Type
                    </button>
                </form>

                {message && (
                    <p style={{ marginTop: "1rem", color: "#f56565" }}>{message}</p>
                )}

                <button
                    type="button"
                    onClick={() => navigate("/leave-types")}
                    style={backButton}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

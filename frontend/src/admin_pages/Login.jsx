import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try{
            const res = await api.post("/employees/login", { email, password });

            setMessage(res.data.message);

            if(res.data.success){
                const role = res.data.user?.role_id;
                if(role === 1){
                    navigate("/dashboard");
                } 
                else if(role === 2){
                    navigate("/employee-dashboard");
                } 
                else{
                    navigate("/login");
                }
            }
        } 
        catch(err){
            setMessage(err.response?.data?.error || "Login failed");
        }
    };

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            backgroundColor: "#121a14"
        }}>
            <div style={{
                backgroundColor: "#1e2d22",
                padding: "2rem",
                borderRadius: "12px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                width: "100%",
                maxWidth: "400px",
                color: "#e0f2e9"
            }}>
                <h1 style={{ textAlign: "center", marginBottom: "1rem", color: "#4ade80" }}>
                    Leave Management System
                </h1>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login</h2>
                <form onSubmit={handleLogin}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            marginBottom: "1rem",
                            borderRadius: "8px",
                            border: "1px solid #334d39",
                            backgroundColor: "#243528",
                            color: "#e0f2e9"
                        }}
                    />
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            marginBottom: "1.5rem",
                            borderRadius: "8px",
                            border: "1px solid #334d39",
                            backgroundColor: "#243528",
                            color: "#e0f2e9"
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            backgroundColor: "#4ade80",
                            color: "#121a14",
                            fontWeight: "600",
                            fontSize: "1rem",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            transition: "background-color 0.3s ease"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#22c55e"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#4ade80"}
                    >
                        Login
                    </button>
                </form>
                {message && (
                    <p style={{
                        marginTop: "1rem",
                        textAlign: "center",
                        color: message.includes("failed") || message.includes("Incorrect") ? "#f87171" : "#4ade80"
                    }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

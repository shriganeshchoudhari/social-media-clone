import { useState } from "react";
import { login } from "./authService";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({ username: "", password: "" });
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        const res = await login(form);
        localStorage.setItem("token", res.data.token);
        navigate("/feed");
    };

    return (
        <form onSubmit={submit}>
            <h2>Login</h2>
            <input
                placeholder="Username"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
                type="password"
                placeholder="Password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button>Login</button>
        </form>
    );
}

import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [form, setForm] = useState({});
    const nav = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        const res = await api.post("/auth/login", form);
        localStorage.setItem("token", res.data.token);
        nav("/feed");
    };

    return (
        <form onSubmit={submit}>
            <input placeholder="Username"
                onChange={e => setForm({ ...form, username: e.target.value })} />
            <input type="password" placeholder="Password"
                onChange={e => setForm({ ...form, password: e.target.value })} />
            <button>Login</button>
        </form>
    );
}

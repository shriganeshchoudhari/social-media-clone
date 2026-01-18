import { useState } from "react";
import { register } from "./authService";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        await register(form);
        navigate("/login");
    };

    return (
        <form onSubmit={submit}>
            <h2>Register</h2>
            <input placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button>Register</button>
        </form>
    );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/authService";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            await forgotPassword(email);
            setMessage({
                type: "success",
                text: "OTP sent to your email. Please check your inbox."
            });
        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to send OTP. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md border border-gray-100 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Forgot Password</h2>

                {message.text && (
                    <div className={`p-3 rounded mb-4 text-sm ${message.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            className="w-full border dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition-colors disabled:opacity-50"
                    >
                        {loading ? "Sending OTP..." : "Send OTP"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <Link to="/login" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                        Back to Login
                    </Link>
                    {message.type === 'success' && (
                        <div className="mt-2">
                            <Link to={`/reset-password?email=${encodeURIComponent(email)}`} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                                Proceed to Reset Password &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

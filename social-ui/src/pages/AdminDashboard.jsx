import { useEffect, useState } from "react";
import api from "../api/axios";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [activeTab, setActiveTab] = useState("reports"); // 'reports', 'users', 'audit'
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const token = localStorage.getItem("token");
            const role = token ? JSON.parse(atob(token.split(".")[1])).role : null;

            const promises = [
                api.get("/admin/users"),
                api.get("/admin/reports")
            ];

            if (role === 'ADMIN') {
                promises.push(api.get("/admin/audit"));
            }

            const results = await Promise.all(promises);

            setUsers(results[0].data);
            setReports(results[1].data);

            if (role === 'ADMIN') {
                setAuditLogs(results[2].data);
            } else {
                setAuditLogs([]);
            }
        } catch (error) {
            console.error("Failed to load admin data", error);
            // Don't show alert if it's just a 403 on one endpoint, but here we handled it.
            // Still, if reports/users fail, we should know.
            alert("Failed to  load admin dashboard. Ensure you have permissions.");
        } finally {
            setLoading(false);
        }
    };

    const banUser = async (username) => {
        if (!window.confirm(`Are you sure you want to ban ${username}?`)) return;

        try {
            await api.post(`/admin/ban/${username}`);
            alert(`${username} has been banned`);
            load();
        } catch (error) {
            console.error("Failed to ban user", error);
            alert("Failed to ban user");
        }
    };

    const unbanUser = async (username) => {
        try {
            await api.post(`/admin/unban/${username}`);
            alert(`${username} has been unbanned`);
            load();
        } catch (error) {
            console.error("Failed to unban user", error);
            alert("Failed to unban user");
        }
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Delete this post? This will also clear all reports for it.")) return;

        try {
            await api.delete(`/admin/posts/${postId}`);
            alert("Post deleted successfully");
            load();
        } catch (error) {
            console.error("Failed to delete post", error);
            alert("Failed to delete post");
        }
    };

    const deleteReport = async (reportId) => {
        try {
            await api.delete(`/admin/reports/${reportId}`);
            load();
        } catch (error) {
            console.error("Failed to delete report", error);
            alert("Failed to delete report");
        }
    };

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return (
            <Layout>
                <Navbar />
                <div className="text-center mt-10 text-gray-500">Loading admin dashboard...</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Navbar />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🛡️ Admin Dashboard</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Manage users and moderate content</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <div className="flex -mb-px space-x-8">
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('reports')}
                        >
                            Reports
                        </button>
                        <button
                            className={`px-4 py-2 font-medium ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Users
                        </button>
                        {(localStorage.getItem("token") && JSON.parse(atob(localStorage.getItem("token").split(".")[1])).role === 'ADMIN') && (
                            <button
                                className={`px-4 py-2 font-medium ${activeTab === 'audit' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                                onClick={() => setActiveTab('audit')}
                            >
                                Audit Logs
                            </button>
                        )}
                    </div>
                </div>

                {/* REPORTS TAB */}
                {activeTab === 'reports' && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {reports.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 text-sm">No reports yet</p>
                        ) : (
                            reports.map(r => (
                                <div key={r.id} className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-orange-800 dark:text-orange-300">Post ID: {r.postId}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">by {r.reporterUsername}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Reason:</strong> {r.reason}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><strong>Content:</strong> {r.postContent}</p>

                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => deletePost(r.postId)}
                                            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                        >
                                            Delete Post
                                        </button>
                                        <button
                                            onClick={() => deleteReport(r.id)}
                                            className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                                        >
                                            Clear Report
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {users.map(u => (
                            <div key={u.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                                <div className="flex-1">
                                    <span className="font-medium text-gray-900 dark:text-white">{u.username}</span>
                                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">({u.email})</span>
                                </div>

                                {u.banned ? (
                                    <div className="flex items-center gap-2">
                                        <span className="text-red-500 font-semibold text-sm">BANNED</span>
                                        {((localStorage.getItem("token") && JSON.parse(atob(localStorage.getItem("token").split(".")[1])).role === 'ADMIN')) && (
                                            <button
                                                onClick={() => unbanUser(u.username)}
                                                className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                            >
                                                Unban
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        {((localStorage.getItem("token") && JSON.parse(atob(localStorage.getItem("token").split(".")[1])).role === 'ADMIN')) && (
                                            <button
                                                onClick={() => banUser(u.username)}
                                                className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                            >
                                                Ban
                                            </button>
                                        )}

                                        <button
                                            onClick={() => api.post(`/admin/warn/${u.username}`).then(() => alert(`Warned ${u.username}`))}
                                            className="ml-2 text-sm bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                        >
                                            Warn
                                        </button>

                                        {((localStorage.getItem("token") && JSON.parse(atob(localStorage.getItem("token").split(".")[1])).role === 'ADMIN')) && (
                                            <>
                                                <button
                                                    onClick={() => api.post(`/admin/suspend/${u.username}?days=7`).then(() => alert(`Suspended ${u.username} for 7 days`))}
                                                    className="ml-2 text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                                                >
                                                    Suspend 7d
                                                </button>

                                                <button
                                                    onClick={() => api.post(`/admin/unsuspend/${u.username}`).then(() => alert(`Unsuspended ${u.username}`))}
                                                    className="ml-2 text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                >
                                                    Unsuspend
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* AUDIT LOGS TAB - ADMIN ONLY */}
                {activeTab === 'audit' && ((localStorage.getItem("token") && JSON.parse(atob(localStorage.getItem("token").split(".")[1])).role === 'ADMIN')) && (
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Audit Logs (Last 50 Actions)</h3>
                        {auditLogs.length === 0 ? (
                            <p className="text-gray-500">No logs found.</p>
                        ) : (
                            <div className="space-y-2">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm text-gray-800 dark:text-gray-200 flex justify-between">
                                        <span>
                                            <span className="font-bold text-red-500">[{log.action}]</span>{" "}
                                            <span className="font-medium text-blue-600">{log.adminUsername || 'Unknown'}</span>{" "}
                                            performed action on <span className="font-medium">{log.targetUsername || 'N/A'}</span>:{" "}
                                            <span className="italic">{log.details}</span>
                                        </span>
                                        <span className="text-gray-400 text-xs">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}

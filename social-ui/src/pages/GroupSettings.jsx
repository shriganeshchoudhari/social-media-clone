import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroup, updateGroup } from "../api/chatService";
import api from "../api/axios"; // Keep for member operations not in chatService yet
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../api/config";

export default function GroupSettings() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general"); // general, members

    // Form states
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [privacy, setPrivacy] = useState("PUBLIC");

    useEffect(() => {
        loadGroup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadGroup = async () => {
        try {
            const res = await getGroup(id);
            const g = res.data;
            setGroup(g);
            setName(g.name);
            setDescription(g.description);
            setPrivacy(g.privacy);

            // Check admin
            if (g.role !== 'ADMIN') {
                alert("Unauthorized");
                navigate(`/groups/${id}`);
                return;
            }

            try {
                // Fetch members
                const mRes = await api.get(`/groups/${id}/members`);
                setMembers(mRes.data);
            } catch (e) {
                console.warn("Failed to load members", e);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            navigate("/groups");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateGroup(id, { name, description, privacy });
            alert("Group updated!");
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;
        try {
            await api.delete(`/groups/${id}`);
            alert("Group deleted");
            navigate("/groups");
        } catch (err) {
            alert("Delete failed: " + (err.response?.data?.message || "Error"));
        }
    };

    return (
        <Layout>
            <Navbar />
            <div className="max-w-4xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4 dark:text-white">Group Settings</h1>

                <div className="flex border-b mb-4 dark:border-gray-700">
                    <button
                        className={`px-4 py-2 ${activeTab === 'general' ? 'border-b-2 border-blue-500 font-bold' : ''} dark:text-gray-300`}
                        onClick={() => setActiveTab('general')}
                    >
                        General
                    </button>
                    <button
                        className={`px-4 py-2 ${activeTab === 'members' ? 'border-b-2 border-blue-500 font-bold' : ''} dark:text-gray-300`}
                        onClick={() => setActiveTab('members')}
                    >
                        Members
                    </button>
                </div>

                {loading ? <div className="dark:text-white">Loading...</div> : (
                    <>
                        {activeTab === 'general' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-6">
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Name</label>
                                        <input
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium dark:text-gray-300">Privacy</label>
                                        <select
                                            value={privacy}
                                            onChange={e => setPrivacy(e.target.value)}
                                            className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        >
                                            <option value="PUBLIC">Public</option>
                                            <option value="PRIVATE">Private</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                        Save Changes
                                    </button>
                                </form>

                                <div className="border-t pt-6 mt-6 dark:border-gray-700">
                                    <h3 className="text-lg font-bold dark:text-white mb-4">Cover Image</h3>
                                    <div className="flex flex-col gap-4">
                                        {group.coverImageUrl && (
                                            <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                                <img
                                                    src={(() => {
                                                        if (group.coverImageUrl.startsWith("http")) return group.coverImageUrl;
                                                        const baseUrl = API_BASE_URL;
                                                        return baseUrl + group.coverImageUrl;
                                                    })()}
                                                    alt="Cover"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <input
                                                type="file"
                                                onChange={async (e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append('file', file);
                                                    try {
                                                        const res = await api.post(`/groups/${id}/cover`, formData, {
                                                            headers: { 'Content-Type': 'multipart/form-data' }
                                                        });
                                                        setGroup(res.data);
                                                        alert("Cover updated!");
                                                    } catch (err) {
                                                        alert("Failed to upload cover");
                                                    }
                                                }}
                                                className="dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-6 dark:border-gray-700">
                                    <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
                                    <button onClick={handleDelete} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
                                        Delete Group
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                                <h3 className="text-lg font-bold dark:text-white mb-4">Members ({members.length})</h3>
                                {members.map(member => (
                                    <div key={member.id} className="flex items-center justify-between p-3 border rounded dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                                                {member.profileImageUrl ? (
                                                    <img src={member.profileImageUrl.startsWith("http") ? member.profileImageUrl : `${API_BASE_URL}${member.profileImageUrl}`} alt={member.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                        {member.username[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold dark:text-white">{member.fullName || member.username}</p>
                                                <p className="text-sm text-gray-500">@{member.username} • {member.role}</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {member.role === 'MEMBER' && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm(`Promote ${member.username} to Admin?`)) return;
                                                        try {
                                                            await api.put(`/groups/${id}/members/${member.userId}/role?role=ADMIN`);
                                                            loadGroup(); // Reload
                                                        } catch (e) { alert("Failed"); }
                                                    }}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Promote
                                                </button>
                                            )}
                                            {member.role === 'ADMIN' && member.username !== group.creatorUsername && (
                                                <button
                                                    onClick={async () => {
                                                        if (!window.confirm(`Demote ${member.username} to Member?`)) return;
                                                        try {
                                                            await api.put(`/groups/${id}/members/${member.userId}/role?role=MEMBER`);
                                                            loadGroup();
                                                        } catch (e) { alert("Failed"); }
                                                    }}
                                                    className="text-sm text-orange-600 hover:underline"
                                                >
                                                    Demote
                                                </button>
                                            )}

                                            <button
                                                onClick={async () => {
                                                    if (!window.confirm(`Kick ${member.username}?`)) return;
                                                    try {
                                                        await api.delete(`/groups/${id}/members/${member.userId}`);
                                                        loadGroup();
                                                    } catch (e) { alert("Failed"); }
                                                }}
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Kick
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}

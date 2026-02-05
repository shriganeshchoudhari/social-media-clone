import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { getMyInvitations, acceptInvitation, rejectInvitation } from "../api/groupService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";

export default function Groups() {
    const [groups, setGroups] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroup, setNewGroup] = useState({ name: "", description: "", privacy: "PUBLIC" });
    const navigate = useNavigate();

    useEffect(() => {
        loadGroups();
        loadInvitations();
    }, []);

    const loadGroups = () => {
        api.get("/groups").then(res => setGroups(res.data)).catch(err => console.error(err));
    };

    const loadInvitations = () => {
        getMyInvitations()
            .then(res => setInvitations(res.data))
            .catch(err => console.error("Failed to load invitations", err));
    };

    const handleAccept = async (id) => {
        try {
            await acceptInvitation(id);
            loadInvitations();
            loadGroups(); // Refresh groups to show new membership count if applicable
        } catch (err) {
            console.error("Failed to accept", err);
            alert("Failed to accept invitation");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectInvitation(id);
            loadInvitations();
        } catch (err) {
            console.error("Failed to reject", err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/groups", newGroup);
            setShowCreateModal(false);
            navigate(`/groups/${res.data.id}`);
        } catch (err) {
            console.error("Failed to create group", err);
            alert("Failed to create group");
        }
    };

    return (
        <Layout>
            <Navbar />
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Communities</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    + Create Group
                </button>
            </div>

            {/* Invitations Section */}
            {invitations.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Invitations</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {invitations.map(invite => (
                            <div key={invite.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-blue-200 dark:border-blue-900">
                                <p className="text-gray-800 dark:text-gray-200 mb-2">
                                    <span className="font-bold">{invite.inviter.username}</span> invited you to join <span className="font-bold">{invite.group.name}</span>
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => handleAccept(invite.id)}
                                        className="flex-1 bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition"
                                    >
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(invite.id)}
                                        className="flex-1 bg-gray-200 text-gray-700 py-1 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 transition"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map(group => (
                    <Link to={`/groups/${group.id}`} key={group.id} className="block group">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg dark:text-white group-hover:text-blue-600 transition-colors">
                                    {group.name}
                                </h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${group.privacy === 'PUBLIC' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {group.privacy}
                                </span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                {group.description}
                            </p>
                            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                <span>{group.memberCount} members</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {groups.length === 0 && invitations.length === 0 && (
                <div className="text-center py-20 text-gray-500">
                    No communities found. Be the first to create one!
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Create Community</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Name</label>
                                <input
                                    required
                                    className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newGroup.name}
                                    onChange={e => setNewGroup({ ...newGroup, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
                                <textarea
                                    className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newGroup.description}
                                    onChange={e => setNewGroup({ ...newGroup, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Privacy</label>
                                <select
                                    className="w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newGroup.privacy}
                                    onChange={e => setNewGroup({ ...newGroup, privacy: e.target.value })}
                                >
                                    <option value="PUBLIC">Public</option>
                                    <option value="PRIVATE">Private</option>
                                </select>
                            </div>
                            <div className="flex gap-2 justify-end mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

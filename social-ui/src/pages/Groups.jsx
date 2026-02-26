import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyGroups, createGroup, searchGroups, getMyInvitations, acceptInvitation, rejectInvitation, inviteUsers } from "../api/groupService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import GroupCreationModal from "../components/GroupCreationModal";
import { API_BASE_URL } from "../api/config";

export default function Groups() {
    // Force HMR update
    const [groups, setGroups] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState("my"); // 'my' or 'discover'
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadGroups();
        loadInvitations();
    }, []);

    useEffect(() => {
        if (activeTab === 'discover') {
            if (searchQuery.trim()) {
                const timer = setTimeout(() => {
                    searchGroups(searchQuery)
                        .then(res => setSearchResults(res.data))
                        .catch(err => console.error(err));
                }, 500);
                return () => clearTimeout(timer);
            } else {
                setSearchResults([]);
            }
        }
    }, [activeTab, searchQuery]);

    const loadGroups = () => {
        getMyGroups()
            .then(res => setGroups(res.data))
            .catch(err => console.error(err));
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
            loadGroups();
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

    const handleCreate = async (name, description, rules, isPublic, participants) => {
        try {
            const res = await createGroup({
                name,
                description,
                rules,
                privacy: isPublic ? "PUBLIC" : "PRIVATE"
            });
            if (participants && participants.length > 0) {
                // If it's a "join" for self checking or auto-add?
                // Actually if I am creator I am added.
                // Invite others.
                try {
                    // inviteUsers from groupService
                    // Need to import inviteUsers if not imported?
                    // It is not imported in Groups.jsx imports currently?
                    // Wait, check imports.
                    // It IS imported?
                    // import { ..., inviteUsers, ... } ??
                    // Check line 3 of Groups.jsx: getMyInvitations, acceptInvitation... inviteUsers is NOT imported.
                    // I need to update imports too.
                    // But first let's see logic.
                    // groupService.inviteUsers(groupId, usernames)
                    // We need to import it.
                    await inviteUsers(res.data.id, participants);
                } catch (inviteErr) {
                    console.error("Failed to invite members", inviteErr);
                    // Don't block creation success
                }
            }
            setShowCreateModal(false);
            navigate(`/groups/${res.data.id}`);
        } catch (err) {
            console.error("Failed to create group", err.response?.data || err);
            alert("Failed to create group: " + (err.response?.data?.message || "Unknown error"));
        }
    };

    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        const apiBase = API_BASE_URL.endsWith('/api') ? API_BASE_URL.slice(0, -4) : API_BASE_URL;
        return `${apiBase}${path}`;
    };

    const renderGroupCard = (group) => (
        <Link to={`/groups/${group.id}`} key={group.id} className="block group-card">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-3">
                    {group.imageUrl ? (
                        <img src={getImageUrl(group.imageUrl)} alt={group.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-xl">
                            {group.name.substring(0, 1)}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-lg dark:text-white group-hover:text-blue-600 transition-colors">
                            {group.name}
                        </h3>
                        <div className="flex gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${group.public ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {group.public ? 'Public' : 'Private'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {group.participants ? group.participants.length : 0} members
                            </span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {group.description || "No description"}
                </p>
            </div>
        </Link>
    );

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

            <div className="flex border-b dark:border-gray-700 mb-6">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'my' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('my')}
                >
                    My Groups
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'discover' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}
                    onClick={() => setActiveTab('discover')}
                >
                    Discover
                </button>
            </div>

            {/* Invitations Section - Only show on My Groups */}
            {activeTab === 'my' && invitations.length > 0 && (
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

            {activeTab === 'my' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map(renderGroupCard)}
                    {groups.length === 0 && invitations.length === 0 && (
                        <div className="col-span-2 text-center py-20 text-gray-500">
                            No communities found. Be the first to create one!
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <input
                        type="text"
                        placeholder="Search for public groups..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full border rounded-lg p-3 dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:border-blue-500"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map(renderGroupCard)}
                        {searchQuery && searchResults.length === 0 && (
                            <div className="col-span-2 text-center py-10 text-gray-500">
                                No public groups found matching "{searchQuery}"
                            </div>
                        )}
                        {!searchQuery && (
                            <div className="col-span-2 text-center py-10 text-gray-500">
                                Type to search public groups...
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showCreateModal && (
                <GroupCreationModal onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
            )}
        </Layout>
    );
}

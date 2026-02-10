import { useState, useEffect } from "react";
import { getGroup, addGroupMember, removeGroupMember, leaveGroup } from "../api/chatService";
import { searchUsers } from "../api/searchService";
import { getCurrentUser } from "../api/userService";
import { useNavigate } from "react-router-dom";

export default function GroupDetailsModal({ groupId, onClose, onUpdate }) {
    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    // Group State
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState("");
    const [isAddingMode, setIsAddingMode] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser().then(res => setCurrentUser(res.data.username)).catch(console.error);
        loadGroup();
    }, [groupId]);

    useEffect(() => {
        if (group) {
            setEditName(group.name);
            setPreviewImage(group.imageUrl ? (group.imageUrl.startsWith("http") ? group.imageUrl : `http://localhost:8081${group.imageUrl}`) : null);
        }
    }, [group]);

    const loadGroup = () => {
        setLoading(true);
        getGroup(groupId)
            .then(res => {
                setGroup(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    // User Search for Adding Members
    useEffect(() => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        const timer = setTimeout(() => {
            searchUsers(query)
                .then(res => {
                    // Filter out existing members
                    const all = res.data.content || [];
                    if (group) {
                        setSearchResults(all.filter(u => !group.participants.some(p => p.username === u.username)));
                    }
                })
                .catch(console.error);
        }, 500);
        return () => clearTimeout(timer);
    }, [query, group]);

    const handleUpdateGroup = async (e) => {
        e.preventDefault();
        try {
            await import("../api/chatService").then(module => module.updateGroup(groupId, editName, editImage));
            setIsEditing(false);
            loadGroup();
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
            alert("Failed to update group");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditImage(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleAddMember = async (username) => {
        try {
            await addGroupMember(groupId, username);
            setIsAddingMode(false);
            setQuery("");
            loadGroup();
            if (onUpdate) onUpdate();
        } catch (e) {
            alert("Failed to add member");
        }
    };

    const handleRemoveMember = async (username) => {
        if (!confirm(`Remove ${username} from group?`)) return;
        try {
            await removeGroupMember(groupId, username);
            loadGroup();
            if (onUpdate) onUpdate();
        } catch (e) {
            alert("Failed to remove member");
        }
    };

    const handleLeaveGroup = async () => {
        if (!confirm("Are you sure you want to leave this group?")) return;
        try {
            await leaveGroup(groupId);
            onClose();
            navigate("/inbox");
        } catch (e) {
            alert("Failed to leave group");
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg">Loading...</div>
        </div>
    );

    if (!group) return null;

    const isAdmin = group.creatorUsername === currentUser || group.admins.some(a => a.username === currentUser);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                    <h2 className="font-bold text-lg dark:text-white">Group Details</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 overflow-y-auto flex-1">
                    {/* Group Header Info */}
                    <div className="text-center mb-6 relative group/header">
                        {isEditing ? (
                            <form onSubmit={handleUpdateGroup}>
                                <div className="mb-4 relative inline-block">
                                    <div className="w-24 h-24 rounded-full mx-auto bg-gray-200 overflow-hidden relative border-2 border-blue-500">
                                        {previewImage ? (
                                            <img src={previewImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                                {editName.substring(0, 1).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                            <label className="cursor-pointer text-white text-xs">
                                                Change
                                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="border rounded px-2 py-1 text-center font-bold text-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 mb-2 w-full"
                                    placeholder="Group Name"
                                    autoFocus
                                />
                                <div className="flex justify-center gap-2 mt-2">
                                    <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Save</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="text-xs bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 mx-auto flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-300 mb-2 overflow-hidden relative">
                                    {group.imageUrl ? (
                                        <img src={group.imageUrl.startsWith("http") ? group.imageUrl : `http://localhost:8081${group.imageUrl}`}
                                            className="w-full h-full object-cover" />
                                    ) : (
                                        group.name.substring(0, 1).toUpperCase()
                                    )}
                                </div>
                                <h3 className="text-xl font-bold dark:text-white flex items-center justify-center gap-2">
                                    {group.name}
                                    {isAdmin && (
                                        <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-blue-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                    )}
                                </h3>
                                <p className="text-sm text-gray-500">{group.participants.length} members</p>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="font-semibold dark:text-gray-200">Members</h4>
                            {isAdmin && (
                                <button
                                    onClick={() => setIsAddingMode(!isAddingMode)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {isAddingMode ? "Cancel" : "+ Add Member"}
                                </button>
                            )}
                        </div>

                        {isAddingMode && (
                            <div className="mb-4 bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                                <input
                                    autoFocus
                                    value={query}
                                    onChange={e => setQuery(e.target.value)}
                                    className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="Search user to add..."
                                />
                                {searchResults.length > 0 && (
                                    <div className="mt-2 max-h-40 overflow-y-auto bg-white dark:bg-gray-800 rounded shadow-sm">
                                        {searchResults.map(u => (
                                            <div
                                                key={u.username}
                                                onClick={() => handleAddMember(u.username)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                                            >
                                                <img
                                                    src={u.profileImageUrl
                                                        ? (u.profileImageUrl.startsWith("http") ? u.profileImageUrl : `http://localhost:8081${u.profileImageUrl}`)
                                                        : `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                                                    className="w-6 h-6 rounded-full"
                                                    alt={u.username}
                                                />
                                                <span className="text-sm dark:text-white">{u.username}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            {group.participants.map(p => (
                                <div key={p.username} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={p.profileImageUrl
                                                ? (p.profileImageUrl.startsWith("http") ? p.profileImageUrl : `http://localhost:8081${p.profileImageUrl}`)
                                                : `https://ui-avatars.com/api/?name=${p.username}&background=random`}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                            alt={p.username}
                                        />
                                        <div>
                                            <p className="font-medium text-sm dark:text-gray-200">
                                                {p.username}
                                                {group.admins.some(a => a.username === p.username) && (
                                                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Admin</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && p.username !== currentUser && (
                                        <button
                                            onClick={() => handleRemoveMember(p.username)}
                                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                                            title="Remove member"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                        onClick={handleLeaveGroup}
                        className="w-full py-2 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        Leave Group
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
// import { createGroup } from "../api/chatService";
import { searchUsers } from "../api/searchService";
import { API_BASE_URL } from "../api/config";

export default function GroupCreationModal({ onClose, onCreate }) {
    const [name, setName] = useState("");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [description, setDescription] = useState("");
    const [rules, setRules] = useState("");
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            setLoading(true);
            searchUsers(query)
                .then(res => {
                    // Filter out already selected users
                    const data = res.data;
                    const all = Array.isArray(data) ? data : (data.content || []);
                    setResults(all.filter(u => !selectedUsers.find(s => s.username === u.username)));
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(timer);
    }, [query, selectedUsers]);

    const handleSelect = (user) => {
        setSelectedUsers([...selectedUsers, user]);
        setQuery("");
        setResults([]);
    };

    const handleRemove = (username) => {
        setSelectedUsers(selectedUsers.filter(u => u.username !== username));
    };

    const handleSubmit = () => {
        if (!name.trim()) return alert("Group name is required");
        if (selectedUsers.length === 0) return alert("Select at least one member");

        onCreate(name, description, rules, isPublic, selectedUsers.map(u => u.username));
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="font-bold text-lg dark:text-white">Create New Group</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Group Name
                        </label>
                        <input
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Weekend Trip"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="What's this group about?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Rules
                        </label>
                        <textarea
                            value={rules}
                            onChange={e => setRules(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Group rules..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={e => setIsPublic(e.target.checked)}
                            className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Public Group (Anyone can search and join)
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Add Members
                        </label>

                        {/* Selected chips */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedUsers.map(u => (
                                <span key={u.username} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                                    {u.username}
                                    <button onClick={() => handleRemove(u.username)} className="hover:text-blue-600">×</button>
                                </span>
                            ))}
                        </div>

                        <input
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Search people..."
                        />

                        {/* Search Results */}
                        {query && (
                            <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-800 shadow-sm relative">
                                {loading && <div className="p-2 text-sm text-gray-500">Loading...</div>}
                                {!loading && results.length === 0 && <div className="p-2 text-sm text-gray-500">No results found</div>}
                                {results.map(u => (
                                    <div
                                        key={u.username}
                                        onClick={() => handleSelect(u)}
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                                    >
                                        <img
                                            src={u.profileImageUrl
                                                ? (u.profileImageUrl.startsWith("http") ? u.profileImageUrl : `${API_BASE_URL}${u.profileImageUrl}`)
                                                : `https://ui-avatars.com/api/?name=${u.username}&background=random`}
                                            className="w-8 h-8 rounded-full object-cover"
                                            alt={u.username}
                                        />
                                        <span className="text-sm font-medium dark:text-white">{u.username}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-2 bg-gray-50 dark:bg-gray-900">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm">
                        Create Group
                    </button>
                </div>
            </div>
        </div>
    );
}

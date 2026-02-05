import { useState, useEffect } from "react";
import api from "../api/axios";

export default function GroupEvents({ groupId, isMember, isAdmin }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Create Form
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [location, setLocation] = useState("");

    useEffect(() => {
        loadEvents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groupId]);

    const loadEvents = async () => {
        try {
            const res = await api.get(`/groups/${groupId}/events`);
            setEvents(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to load events", err);
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/groups/${groupId}/events`, {
                title,
                description,
                startTime,
                location
            });
            setShowCreateModal(false);
            resetForm();
            loadEvents();
            alert("Event created!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create event");
        }
    };

    const handleDelete = async (eventId) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await api.delete(`/groups/events/${eventId}`);
            loadEvents();
        } catch (err) {
            alert("Failed to delete event");
        }
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStartTime("");
        setLocation("");
    };

    if (loading) return <div>Loading events...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold dark:text-white">Upcoming Events</h3>
                {isMember && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                        + Create
                    </button>
                )}
            </div>

            {events.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No upcoming events.</p>
            ) : (
                <div className="space-y-3">
                    {events.map(event => (
                        <div key={event.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow border dark:border-gray-700">
                            <div className="flex justify-between">
                                <div>
                                    <h4 className="font-bold text-lg dark:text-white">{event.title}</h4>
                                    <p className="text-sm text-blue-600 font-medium">
                                        {new Date(event.startTime).toLocaleString()}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">{event.description}</p>
                                    {event.location && (
                                        <p className="text-sm text-gray-500 mt-2">📍 {event.location}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-2">
                                        Organizer: @{event.organizerUsername || "User"}
                                    </p>
                                </div>
                                {(isAdmin || true) && ( // Check if creator? 
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="text-red-500 hover:text-red-700 h-8 w-8"
                                        title="Delete Event"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 dark:text-white">Create Event</h3>
                        <form onSubmit={handleCreate} className="space-y-3">
                            <div>
                                <label className="block text-sm dark:text-gray-300">Title</label>
                                <input
                                    required
                                    className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={title} onChange={e => setTitle(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm dark:text-gray-300">Description</label>
                                <textarea
                                    className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={description} onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm dark:text-gray-300">Start Time</label>
                                <input
                                    type="datetime-local"
                                    required
                                    className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={startTime} onChange={e => setStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm dark:text-gray-300">Location</label>
                                <input
                                    className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={location} onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

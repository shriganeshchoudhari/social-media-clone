import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { updateProfile, changePassword, getCurrentUser, getMyInterests, togglePrivacy, deleteAccount } from "../api/userService";

export default function Settings() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        username: "",
        email: "",
        bio: "",
        isPrivate: false,
        interests: [] // ensure interests is initialized
    });

    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [newInterest, setNewInterest] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const response = await getCurrentUser();
            const user = response.data;

            // Fetch interests separately
            const interestsResponse = await getMyInterests();
            const interests = interestsResponse.data;

            setProfile({
                username: user.username,
                email: user.email,
                bio: user.bio || "",
                isPrivate: user.isPrivate || false,
                interests: interests || []
            });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to load profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await updateProfile(profile);
            setMessage({ type: "success", text: "Profile updated successfully" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }

        try {
            setLoading(true);
            await changePassword(passwords);
            setMessage({ type: "success", text: "Password changed successfully" });
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            setMessage({ type: "error", text: "Failed to change password" });
        } finally {
            setLoading(false);
        }
    };

    const handlePrivacyToggle = async () => {
        try {
            console.log('Toggle clicked, current state:', profile.isPrivate);
            const updated = await togglePrivacy();
            console.log('Toggle response (full):', JSON.stringify(updated, null, 2));
            console.log('isPrivate field:', updated.isPrivate);
            console.log('private field:', updated.private);

            // Handle both field names (isPrivate or private)
            const newPrivateState = updated.isPrivate !== undefined ? updated.isPrivate : updated.private;

            setProfile(prev => ({ ...prev, isPrivate: newPrivateState }));
            setMessage({ type: "success", text: `Account is now ${newPrivateState ? 'Private' : 'Public'}` });
        } catch (err) {
            console.error('Privacy toggle error:', err);
            setMessage({ type: "error", text: `Failed to toggle privacy: ${err.response?.data?.message || err.message}` });
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure? This cannot be undone.")) return;

        try {
            await deleteAccount();
            navigate("/login");
        } catch (err) {
            setMessage({ type: "error", text: "Failed to delete account" });
        }
    };

    const handleAddInterest = (e) => {
        e.preventDefault();
        if (!newInterest.trim()) return;
        if (profile.interests.includes(newInterest.trim())) {
            setNewInterest("");
            return;
        }

        setProfile(prev => ({
            ...prev,
            interests: [...prev.interests, newInterest.trim()]
        }));
        setNewInterest("");
    };

    const removeInterest = (interest) => {
        setProfile(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    return (
        <Layout>
            <Navbar />
            <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>

                {message.text && (
                    <div className={`p-4 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Profile Settings</h2>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Bio</label>
                            <textarea
                                value={profile.bio || ""}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Interests</label>
                            <div className="flex gap-2 mb-2 flex-wrap">
                                {profile.interests.map(interest => (
                                    <span key={interest} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-1">
                                        {interest}
                                        <button type="button" onClick={() => removeInterest(interest)} className="hover:text-blue-900">&times;</button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newInterest}
                                    onChange={e => setNewInterest(e.target.value)}
                                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Add interest"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddInterest}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-white"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="flex items-center justify-between">
                                <span className="dark:text-white">Private Account</span>
                                <button
                                    type="button"
                                    onClick={handlePrivacyToggle}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${profile.isPrivate ? 'bg-blue-600' : 'bg-gray-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${profile.isPrivate ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Private accounts only allow followers to see posts.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">Change Password</h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Current Password</label>
                            <input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">New Password</label>
                            <input
                                type="password"
                                value={passwords.newPassword}
                                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Confirm Password</label>
                            <input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            Update Password
                        </button>
                    </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-red-200">
                    <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </Layout>
    );
}

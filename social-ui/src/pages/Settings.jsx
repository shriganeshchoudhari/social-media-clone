import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";
import { updateProfile, changePassword, getCurrentUser, togglePrivacy, deleteAccount } from "../api/userService";

export default function Settings() {
    const navigate = useNavigate();

    const [bio, setBio] = useState("");
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isPrivate, setIsPrivate] = useState(false);

    const [oldPass, setOldPass] = useState("");
    const [newPass, setNewPass] = useState("");

    const [profileMessage, setProfileMessage] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [privacyMessage, setPrivacyMessage] = useState("");

    // Load current user data
    useEffect(() => {
        getCurrentUser()
            .then(res => {
                const user = res.data;
                if (user.bio) setBio(user.bio);
                // If user has a profile image, showing it as preview might be tricky without a full URL
                // But we can construct it if we know the base URL or if user.profileImageUrl is relative
                if (user.profileImageUrl) {
                    setAvatarPreview(`http://localhost:8081${user.profileImageUrl}`);
                }
                setIsPrivate(user.isPrivate);
            })
            .catch(err => console.error("Failed to load user settings", err));
    }, []);

    // ✅ Handle Avatar Selection
    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    // ✅ Update Profile
    const submitProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(bio, avatar);
            setProfileMessage("✅ Profile updated successfully!");
            setTimeout(() => setProfileMessage(""), 3000);
        } catch (error) {
            setProfileMessage("❌ Failed to update profile");
            console.error(error);
        }
    };

    // ✅ Change Password
    const submitPassword = async (e) => {
        e.preventDefault();
        try {
            await changePassword(oldPass, newPass);
            setPasswordMessage("✅ Password changed successfully!");
            setOldPass("");
            setNewPass("");
            setTimeout(() => setPasswordMessage(""), 3000);
        } catch (error) {
            const message = error.response?.data?.message || "Failed to change password";
            setPasswordMessage(`❌ ${message}`);
            console.error(error);
        }
    };

    // ✅ Toggle Privacy
    const handleTogglePrivacy = async () => {
        try {
            await togglePrivacy();
            setIsPrivate(!isPrivate); // Optimistic update
            setPrivacyMessage("✅ Privacy settings updated!");
            setTimeout(() => setPrivacyMessage(""), 3000);
        } catch (error) {
            console.error(error);
            setPrivacyMessage("❌ Failed to update privacy");
        }
    }

    // ✅ Delete Account
    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteAccount();
            localStorage.removeItem("token");
            navigate("/login");
        } catch (error) {
            console.error(error);
            alert("Failed to delete account");
        }
    }

    return (
        <Layout>
            <Navbar />

            <div className="max-w-2xl mx-auto p-4">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Settings</h2>

                {/* PROFILE UPDATE */}
                <form onSubmit={submitProfile}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">

                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Profile</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Bio
                        </label>
                        <textarea
                            className="w-full border dark:border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="Tell us about yourself..."
                            rows="4"
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Profile Picture
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
                            onChange={handleAvatarChange}
                        />
                        {avatarPreview && (
                            <img
                                src={avatarPreview}
                                alt="Preview"
                                className="mt-3 w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                            />
                        )}
                    </div>

                    {profileMessage && (
                        <div className={`mb-4 p-3 rounded ${profileMessage.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {profileMessage}
                        </div>
                    )}

                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Save Profile
                    </button>
                </form>

                {/* PASSWORD UPDATE */}
                <form onSubmit={submitPassword}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">

                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Change Password</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            Current Password
                        </label>
                        <input
                            type="password"
                            className="w-full border dark:border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter current password"
                            value={oldPass}
                            onChange={e => setOldPass(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="w-full border dark:border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            placeholder="Enter new password (min. 6 characters)"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {passwordMessage && (
                        <div className={`mb-4 p-3 rounded ${passwordMessage.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {passwordMessage}
                        </div>
                    )}

                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                        Change Password
                    </button>
                </form>

                {/* PRIVACY & DANGER ZONE */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Privacy & Security</h3>

                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">Private Account</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                When your account is private, only people you approve can see your posts.
                            </p>
                        </div>
                        <button
                            onClick={handleTogglePrivacy}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isPrivate ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPrivate ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {privacyMessage && (
                        <div className={`mb-4 p-3 rounded ${privacyMessage.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800'}`}>
                            {privacyMessage}
                        </div>
                    )}

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                        <h4 className="text-red-600 font-medium mb-2">Danger Zone</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button
                            onClick={handleDeleteAccount}
                            className="bg-white border border-red-600 text-red-600 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/20 px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

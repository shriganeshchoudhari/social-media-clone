import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getProfile, toggleFollow, updateProfile } from "../api/profileService";
import Layout from "../components/Layout";
import Navbar from "../components/Navbar";

export default function Profile() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    // Get current user on mount (lazy init)
    const [currentUser] = useState(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return payload.sub;
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
        return "";
    });

    const load = useCallback(() => {
        getProfile(username).then(res => {
            setProfile(res.data);
            setEditBio(res.data.bio || "");
        });
    }, [username]);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsEditing(false); // Reset edit mode on profile change
    }, [load]);

    const handleSave = async () => {
        try {
            // Passing current image url back to avoid clearing it, or empty string
            await updateProfile(editBio, profile.profileImageUrl || "");
            setIsEditing(false);
            load();
        } catch (e) {
            alert("Failed to update profile");
            console.error(e);
        }
    };

    if (!profile) return (
        <Layout>
            <Navbar />
            <div className="text-center mt-10 text-gray-500">Loading...</div>
        </Layout>
    );

    const isMe = currentUser === profile.username;

    return (
        <Layout>
            <Navbar />
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 transition-colors duration-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{profile.username}</h2>

                        {isEditing ? (
                            <div className="mb-4">
                                <textarea
                                    className="w-full border dark:border-gray-600 rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white resize-none"
                                    rows="3"
                                    value={editBio}
                                    onChange={e => setEditBio(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleSave}
                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                                {profile.bio || "No bio available"}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex gap-6 text-sm mb-6 border-b border-gray-100 dark:border-gray-700 pb-4 text-gray-700 dark:text-gray-300">
                    <div><span className="font-bold text-gray-900 dark:text-white">{profile.postCount}</span> posts</div>
                    <div><span className="font-bold text-gray-900 dark:text-white">{profile.followerCount}</span> followers</div>
                    <div><span className="font-bold text-gray-900 dark:text-white">{profile.followingCount}</span> following</div>
                </div>

                {isMe ? (
                    !isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 rounded font-medium transition-colors bg-white border border-gray-300 dark:bg-gray-800 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            Edit Profile
                        </button>
                    )
                ) : (
                    <button
                        onClick={() => toggleFollow(profile.username).then(load)}
                        className={`px-6 py-2 rounded font-medium transition-colors ${profile.following
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                    >
                        {profile.following ? "Unfollow" : "Follow"}
                    </button>
                )}
            </div>
        </Layout>
    );
}

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProfile, toggleFollow } from "../api/profileService";

export default function Profile() {

    const { username } = useParams();
    const [profile, setProfile] = useState(null);

    const load = () => {
        getProfile(username).then(res => setProfile(res.data));
    };

    useEffect(() => {
        load();
    }, [username]);

    if (!profile) return null;

    return (
        <div>
            <h2>{profile.username}</h2>
            <p>{profile.bio}</p>

            <p>
                {profile.postCount} posts ·
                {profile.followerCount} followers ·
                {profile.followingCount} following
            </p>

            <button onClick={() => {
                toggleFollow(profile.username).then(load);
            }}>
                {profile.following ? "Unfollow" : "Follow"}
            </button>
        </div>
    );
}

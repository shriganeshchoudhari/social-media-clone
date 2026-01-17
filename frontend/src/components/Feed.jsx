import { useEffect, useState } from 'react';
import axios from 'axios';
import PostItem from './PostItem';

export default function Feed({ refreshTrigger }) {
    const [posts, setPosts] = useState([]);

    const load = async () => {
        const resp = await axios.get('http://localhost:8081/api/posts');
        setPosts(resp.data);
    };

    useEffect(() => {
        load();
    }, [refreshTrigger]);

    return (
        <div>
            {posts.slice().reverse().map(p => (
                <PostItem key={p.id} post={p} refresh={load} />
            ))}
        </div>
    );
}

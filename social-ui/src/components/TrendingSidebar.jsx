import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrendingTopics } from "../api/postService"; // Need to add this to postService

export default function TrendingSidebar() {
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getTrendingTopics()
            .then(res => setTrends(res.data))
            .catch(err => console.error("Failed to load trends", err))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
            </div>
        </div>
    );

    if (trends.length === 0) return null;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">Trending Topics</h2>
            <div className="space-y-3">
                {trends.map((topic, index) => (
                    <Link
                        key={index}
                        to={`/search?q=%23${topic.tag}`}
                        className="block group"
                    >
                        <div className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            #{topic.tag}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {topic.count} posts
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

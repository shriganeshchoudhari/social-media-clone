import { Link } from "react-router-dom";

export default function RichText({ text }) {
    if (!text) return null;

    // Regex to match:
    // 1. Mentions: @username
    // 2. Hashtags: #hashtag
    // 3. URLs: http://... or https://...
    const regex = /(@\w+)|(#\w+)|(https?:\/\/[^\s]+)/g;

    const parts = text.split(regex);

    return (
        <span className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-300">
            {parts.map((part, i) => {
                if (!part) return null;

                if (part.startsWith("@")) {
                    const username = part.substring(1);
                    return (
                        <Link
                            key={i}
                            to={`/profile/${username}`}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                            {part}
                        </Link>
                    );
                }

                if (part.startsWith("#")) {
                    // Placeholder link for search
                    return (
                        <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">
                            {part}
                        </span>
                    );
                }

                if (part.startsWith("http")) {
                    return (
                        <a
                            key={i}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                            {part}
                        </a>
                    );
                }

                return <span key={i}>{part}</span>;
            })}
        </span>
    );
}

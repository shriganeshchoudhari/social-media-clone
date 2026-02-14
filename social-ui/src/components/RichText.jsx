import { Link } from "react-router-dom";

export default function RichText({ text, disableLinks = false }) {
    if (!text) return null;

    // Regex to match:
    // 1. Mentions: @username
    // 2. Hashtags: #hashtag
    // 3. URLs: http://... or https://...
    // Regex to match:
    // 1. Mentions: @username
    // 2. Hashtags: #hashtag
    // 3. URLs: http://..., https://..., or www....
    // We use a single capturing group for the whole URL to avoid split creating multiple undefined parts
    const regex = /(@\w+)|(#\w+)|((?:https?:\/\/|www\.)[^\s]+)/g;

    const parts = text.split(regex);

    return (
        <span className="whitespace-pre-wrap break-words text-gray-800 dark:text-gray-300">
            {parts.map((part, i) => {
                if (!part) return null;

                if (part.startsWith("@")) {
                    const username = part.substring(1);
                    if (disableLinks) {
                        return (
                            <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">
                                {part}
                            </span>
                        );
                    }
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

                if (part.startsWith("http") || part.startsWith("www")) {
                    let href = part;
                    if (part.startsWith("www")) {
                        href = `https://${part}`;
                    }
                    if (disableLinks) {
                        return (
                            <span key={i} className="text-blue-600 dark:text-blue-400 break-all">
                                {part}
                            </span>
                        );
                    }
                    return (
                        <a
                            key={i}
                            href={href}
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

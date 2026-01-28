import { useState } from "react";
import { createPost } from "../api/postService";

export default function CreatePost({ onPost }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);

    const submit = async (e) => {
        e.preventDefault();
        if (!content.trim() && files.length === 0) return;

        setLoading(true);
        try {
            await createPost(content, files);
            setContent("");
            setFiles([]);
            onPost(); // refresh feed
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <form
            onSubmit={submit}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6 transition-colors duration-200"
        >
            <textarea
                className="w-full border rounded p-2 text-sm mb-2 resize-none outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                rows="3"
                placeholder="What's on your mind?"
                value={content}
                onChange={e => setContent(e.target.value)}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => setFiles([...e.target.files])}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </label>
                    {files.length > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                            {files.length} image{files.length > 1 ? 's' : ''} selected
                        </span>
                    )}
                </div>

                <button
                    disabled={(!content.trim() && files.length === 0) || loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50 transition-colors font-medium"
                >
                    {loading ? "Posting..." : "Post"}
                </button>
            </div>

            {/* Image Preview */}
            {files.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                    {files.map((f, i) => (
                        <div key={i} className="relative group">
                            <img
                                src={URL.createObjectURL(f)}
                                alt={`Preview ${i + 1}`}
                                className="w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-600"
                            />
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </form>
    );
}

import { useState } from "react";
import { createPost } from "../api/postService";

export default function CreatePost({ onPost, extraData = {} }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [showPoll, setShowPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const [pollDuration, setPollDuration] = useState(1);

    const submit = async (e) => {
        e.preventDefault();
        // Validation
        if (!content.trim() && files.length === 0 && !videoFile && !pollQuestion.trim()) return;
        if (showPoll && (!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2)) {
            alert("Please provide a question and at least 2 options for the poll.");
            return;
        }

        setLoading(true);
        try {
            await createPost(
                content,
                files,
                videoFile,
                extraData.groupId,
                showPoll ? pollQuestion : null,
                showPoll ? pollOptions.filter(o => o.trim()) : null,
                showPoll ? pollDuration : null,
                extraData.sharedPostId
            );

            // Reset form
            setContent("");
            setFiles([]);
            setVideoFile(null);
            setShowPoll(false);
            setPollQuestion("");
            setPollOptions(["", ""]);
            onPost(); // refresh feed
        } catch (error) {
            console.error("Failed to create post", error);
            if (error.response && error.response.data && error.response.data.error) {
                alert(error.response.data.error);
            } else {
                alert("Failed to create post");
            }
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    const addOption = () => {
        if (pollOptions.length < 5) {
            setPollOptions([...pollOptions, ""]);
        }
    };

    const removeOption = (index) => {
        if (pollOptions.length > 2) {
            setPollOptions(prev => prev.filter((_, i) => i !== index));
        }
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
                aria-label="Post content"
                value={content}
                onChange={e => setContent(e.target.value)}
            />

            {/* Poll UI */}
            {showPoll && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-750/50 rounded border dark:border-gray-600">
                    <input
                        type="text"
                        placeholder="Ask a question..."
                        aria-label="Poll question"
                        className="w-full border-b bg-transparent p-2 mb-2 text-sm focus:border-blue-500 outline-none dark:text-gray-100 dark:border-gray-500"
                        value={pollQuestion}
                        onChange={e => setPollQuestion(e.target.value)}
                    />
                    <div className="space-y-2">
                        {pollOptions.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={`Option ${idx + 1}`}
                                    aria-label={`Poll option ${idx + 1}`}
                                    className="flex-1 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                />
                                {pollOptions.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="text-red-400 hover:text-red-500"
                                        aria-label={`Remove option ${idx + 1}`}
                                    >×</button>
                                )}
                            </div>
                        ))}
                    </div>
                    {pollOptions.length < 5 && (
                        <button
                            type="button"
                            onClick={addOption}
                            className="text-xs text-blue-600 dark:text-blue-400 mt-2 hover:underline"
                        >
                            + Add Option
                        </button>
                    )}
                    <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                        <span>Duration: 1 Day</span>
                        {/* Could add duration selector here */}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Image Upload */}
                    <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Add Image">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => setFiles([...e.target.files])}
                            aria-label="Upload images"
                            disabled={videoFile !== null}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        <span className="sr-only">Add Image</span>
                    </label>

                    {/* Video Upload */}
                    <label className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" title="Add Video">
                        <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={e => {
                                setVideoFile(e.target.files[0]);
                                setFiles([]); // Clear images if video selected
                            }}
                            aria-label="Upload video"
                            disabled={files.length > 0}
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span className="sr-only">Add Video</span>
                    </label>

                    {/* Poll Toggle */}
                    <button
                        type="button"
                        onClick={() => setShowPoll(!showPoll)}
                        className={`p-2 rounded-full transition-colors ${showPoll ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title="Create Poll"
                        aria-label={showPoll ? "Remove poll" : "Create a poll"}
                        aria-pressed={showPoll}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                    </button>

                    {files.length > 0 && (
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                            {files.length} image{files.length > 1 ? 's' : ''} selected
                        </span>
                    )}
                    {videoFile && (
                        <span className="text-xs text-purple-600 dark:text-purple-400">
                            1 video selected
                        </span>
                    )}
                </div>

                <button
                    disabled={(!content.trim() && files.length === 0 && !videoFile && !pollQuestion.trim()) || loading}
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
                                aria-label={`Remove image ${i + 1}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Video Preview */}
            {videoFile && (
                <div className="relative group mt-3 inline-block">
                    <video
                        src={URL.createObjectURL(videoFile)}
                        className="w-40 h-24 object-cover rounded border border-gray-200 dark:border-gray-600"
                        controls
                    />
                    <button
                        type="button"
                        onClick={() => setVideoFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        aria-label="Remove video"
                    >
                        ×
                    </button>
                </div>
            )}
        </form>
    );
}

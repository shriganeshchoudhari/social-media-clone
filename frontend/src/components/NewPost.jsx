import { useState } from "react";
import axios from "axios";

export default function NewPost({ onPost }) {
  const [content, setContent] = useState("");
  const handleSubmit = async () => {
    if (!content.trim()) return alert("Post cannot be empty");
    await axios.post("http://localhost:8081/api/posts", content, {
      headers: { "Content-Type": "text/plain" },
    });
    setContent("");
    onPost();
  };
  return (
    <div className="post-card">
      <textarea
        rows={3}
        placeholder="What’s on your mind?"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius)", border: "none", background: "var(--card-bg)", color: "var(--text-primary)" }}
      />
      <button onClick={handleSubmit}>Post</button>
    </div>
  );
}

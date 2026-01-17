import { useState } from "react";
import NewPost from "./components/NewPost";
import Feed from "./components/Feed";
import "./index.css";

export default function App() {
  const [refresh, setRefresh] = useState(0);
  const trigger = () => setRefresh(r => r + 1);
  return (
    <div className="main">
      <header className="app-header"><h1>Social Media Clone</h1></header>
      <NewPost onPost={trigger} />
      <Feed refreshTrigger={refresh} />
    </div>
  );
}


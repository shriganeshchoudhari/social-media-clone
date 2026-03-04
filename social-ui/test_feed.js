import axios from "axios";

async function testFeed() {
    try {
        const ts = Date.now();
        const userA = `userA_${ts}`;
        const userB = `userB_${ts}`;

        // 1. Register User B
        let res = await axios.post("http://localhost:8081/api/auth/register", {
            username: userB, email: `${userB}@example.com`, password: "Password123!"
        });
        const tokenB = res.data.token;

        // 2. User B creates post
        let formData = new FormData();
        formData.append("content", `Hello from ${userB}`);
        await axios.post("http://localhost:8081/api/posts", formData, {
            headers: { Authorization: `Bearer ${tokenB}` }
        });

        // 3. Register User A
        res = await axios.post("http://localhost:8081/api/auth/register", {
            username: userA, email: `${userA}@example.com`, password: "Password123!"
        });
        const tokenA = res.data.token;

        // 4. User A follows User B
        await axios.post(`http://localhost:8081/api/users/${userB}/follow`, null, {
            headers: { Authorization: `Bearer ${tokenA}` }
        });

        // 5. User A gets personal feed
        res = await axios.get("http://localhost:8081/api/posts/feed/personal?page=0&size=10", {
            headers: { Authorization: `Bearer ${tokenA}` }
        });

        console.log("Feed Posts Count: ", res.data.content.length);
        if (res.data.content.length > 0) {
            console.log("First Post Content: ", res.data.content[0].content);
            console.log("First Post Author: ", res.data.content[0].authorUsername);
        } else {
            console.log("No posts found in feed! Bug confirmed!");
        }

    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
testFeed();

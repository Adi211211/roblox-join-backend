const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

app.get("/joininfo/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const userRes = await axios.get(`https://api.roblox.com/users/get-by-username?username=${username}`);
    const userId = userRes.data.Id;

    if (!userId) return res.status(404).json({ error: "User not found" });

    const presenceRes = await axios.post(
      "https://presence.roblox.com/v1/presence/users",
      { userIds: [userId] },
      { headers: { "Content-Type": "application/json" } }
    );

    const data = presenceRes.data.userPresences[0];

    if (data.userPresenceType === 2) {
      return res.json({
        status: "InGame",
        userId: userId,
        placeId: data.placeId,
        jobId: data.gameSessionId,
        lastLocation: data.lastLocation
      });
    } else {
      return res.json({ status: "Offline", userId });
    }
  } catch (err) {
    console.error("Backend error:", err.message);
    res.status(500).json({ error: "Internal error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ Backend is running on port ${port}`);
});

import express from "express";
import cors from "cors";
import { buildLeaderboard } from "./scripts/buildLeaderboard.js";
import { syncMatches } from "./scripts/syncMatches.js";

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await buildLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to build leaderboard" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get("/api/sync-matches", async (req, res) => {
  if (req.query.secret !== process.env.SYNC_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await syncMatches();
    res.json({ success: true, synced_at: new Date().toISOString() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sync failed" });
  }
});

import express from "express";
import { ROOM_CODE_LENGTH } from "@movie-roulette/shared";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} — room codes are ${ROOM_CODE_LENGTH} digits`);
});
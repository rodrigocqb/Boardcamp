import express from "express";
import { getGames } from "../controllers/gameController.js";

const router = express.Router();

router.get("/games", getGames);

export default router;

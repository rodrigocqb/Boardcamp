import express from "express";
import { createRental, getRentals } from "../controllers/rentalController.js";

const router = express.Router();

router.get("/rentals", getRentals);
router.post("/rentals", createRental);

export default router;

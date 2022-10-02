import express from "express";
import {
  createRental,
  endRental,
  getRentals,
} from "../controllers/rentalController.js";

const router = express.Router();

router.get("/rentals", getRentals);
router.post("/rentals", createRental);
router.post("/rentals/:id/return", endRental);

export default router;

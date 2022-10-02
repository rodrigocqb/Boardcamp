import express from "express";
import {
  createRental,
  deleteRental,
  endRental,
  getRentals,
} from "../controllers/rentalController.js";
import checkRental from "../middlewares/rentalIdValidationMiddleware.js";

const router = express.Router();

router.get("/rentals", getRentals);
router.post("/rentals", createRental);
router.post("/rentals/:id/return", checkRental, endRental);
router.delete("/rentals/:id", checkRental, deleteRental);

export default router;

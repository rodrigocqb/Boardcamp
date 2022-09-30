import express from "express";
import {
  getCustomer,
  getCustomers,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/customers", getCustomers);
router.get("/customer/:id", getCustomer);

export default router;

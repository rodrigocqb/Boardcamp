import express from "express";
import {
  createCustomer,
  getCustomer,
  getCustomers,
} from "../controllers/customerController.js";

const router = express.Router();

router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomer);
router.post("/customers", createCustomer);

export default router;

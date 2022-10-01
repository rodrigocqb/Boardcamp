import express from "express";
import {
  createCustomer,
  getCustomer,
  getCustomers,
  updateCustomer,
} from "../controllers/customerController.js";
import isCpfRegistered from "../middlewares/customerCpfRequestValidationMiddleware.js";
import isCustomerRegistered from "../middlewares/customerIdValidationMiddleware.js";
import customerSchemaValidation from "../middlewares/customerSchemaValidationMiddleware.js";

const router = express.Router();

router.get("/customers", getCustomers);
router.get("/customers/:id", isCustomerRegistered, getCustomer);
router.post(
  "/customers",
  customerSchemaValidation,
  isCpfRegistered,
  createCustomer
);
router.put(
  "/customers/:id",
  customerSchemaValidation,
  isCustomerRegistered,
  isCpfRegistered,
  updateCustomer
);

export default router;

import express from "express";
import {
  createCustomer,
  getCustomer,
  getCustomers,
} from "../controllers/customerController.js";
import isCpfRegistered from "../middlewares/customerCpfRequestValidationMiddleware.js";
import customerSchemaValidation from "../middlewares/customerSchemaValidationMiddleware.js";

const router = express.Router();

router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomer);

router.use(customerSchemaValidation);
router.use(isCpfRegistered);
router.post("/customers", createCustomer);

export default router;

import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/categoryController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/categories", createCategory);

export default router;

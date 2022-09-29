import express from "express";
import cors from "cors";
import categoryRouter from "./routers/categoryRouter.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(categoryRouter);

export default app;

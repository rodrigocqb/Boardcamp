import express from "express";
import cors from "cors";
import categoryRouter from "./routers/categoryRouter.js";
import gameRouter from "./routers/gameRouter.js";

const app = express();
app.use(express.json());
app.use(cors());

app.use(categoryRouter);
app.use(gameRouter);

export default app;

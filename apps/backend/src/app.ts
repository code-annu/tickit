import cors from "cors";
import express, { type Express } from "express";

const app: Express = express();

app.use(express.json());
app.use(cors());

export default app;

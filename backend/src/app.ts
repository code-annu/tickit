import express from "express";
import cookieParser from "cookie-parser";
import handleError from "./shared/middleware/error-handler.middleware";
import container from "./core/di/inversify.config";
import TYPES from "./core/di/inversify.types";
import AuthRouter from "./modules/auth/auth.router";

const app = express();

app.use(express.json());
app.use(cookieParser());

// Auth routes
const authRouter = container.get<AuthRouter>(TYPES.AuthRouter);
app.use("/api/auth", authRouter.router);

app.use(handleError);

export default app;

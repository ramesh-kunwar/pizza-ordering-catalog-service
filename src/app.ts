import express, { Request, Response } from "express";
import { globalErrorHandler } from "./common/middlewares/globalErrorHandler";

const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({
        message: "Hello From Catalog Service",
    });
});

app.use(globalErrorHandler);

export default app;

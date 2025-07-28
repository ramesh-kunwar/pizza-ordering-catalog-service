import { NextFunction, Request, Response } from "express";

export class CategoryController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            // Logic to create a category
            res.status(201).send({ message: "Category created successfully" });
        } catch (error) {
            next(error);
        }
    }
}

import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { ProductService } from "./product-service";
import { Product, CreateProductRequest } from "./product-types";

export class ProductController {
    constructor(private productService: ProductService) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublished,
            // image, // image is not used here, but can be handled later
        } = req.body as CreateProductRequest;

        const product: Product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublished,
            // todo: image upload
            image: "image.jpg",
        };

        const newProduct = await this.productService.createProduct(product);

        // create product
        // todo : image upload
        // todo: save product to db

        // todo: send response
        res.json({
            id: (newProduct as { id: unknown }).id,
        });
    };
}

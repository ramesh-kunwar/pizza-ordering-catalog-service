import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { ProductService } from "./product-service";
import { Product, CreateProductRequest } from "./product-types";

import { FileStorage } from "../common/types/storage";

import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";

export class ProductController {
    constructor(
        private productService: ProductService,
        private storage: FileStorage,
    ) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const imageName = uuidv4();
        // TODO : Image upload
        const image = req.files?.image as UploadedFile;
        await this.storage.upload({
            filename: imageName,
            fileData: image.data.buffer,
        });

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublished,
        } = req.body as CreateProductRequest;

        const product: Product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublished,
            image: imageName,
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

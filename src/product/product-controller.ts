import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { ProductService } from "./product-service";
import { Product, CreateProductRequest, Filter } from "./product-types";

import { FileStorage } from "../common/types/storage";

import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../common/types";
import { Roles } from "../common/constants";
import mongoose from "mongoose";
import logger from "../config/logger";

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

        // Check if image file exists
        if (!req.files?.image) {
            return next(createHttpError(400, "Product image is required"));
        }

        const image = req.files.image as UploadedFile;

        try {
            // Upload image to Cloudinary
            await this.storage.upload({
                filename: imageName,
                fileData: image.data,
            });

            logger.info(`Image uploaded successfully: ${imageName}`);
        } catch (error) {
            logger.error(`Failed to upload image: ${(error as Error).message}`);
            return next(createHttpError(500, "Failed to upload product image"));
        }

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
            id: newProduct._id,
        });
    };

    update = async (req: Request, res: Response, next: NextFunction) => {
        const result = validationResult(req);

        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { productId } = req.params;

        const product = await this.productService.getProduct(productId);
        if (!product) {
            return next(createHttpError(404, "Product not found"));
        }

        // check if tenant has access to the product -> skip if admin
        if ((req as AuthRequest).auth.role !== Roles.ADMIN) {
            const tenant = (req as AuthRequest).auth?.tenant;

            if (product.tenantId !== String(tenant)) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to access this product",
                    ),
                );
            }
        }
        let imageName: string | undefined;
        let oldImage: string | undefined;
        if (req.files?.image) {
            oldImage = product.image;

            const image = req.files.image as UploadedFile;
            imageName = uuidv4();

            try {
                // Upload new image to Cloudinary
                await this.storage.upload({
                    filename: imageName,
                    fileData: image.data,
                });

                logger.info(`New image uploaded successfully: ${imageName}`);

                // Delete old image from Cloudinary
                if (oldImage) {
                    await this.storage.delete(oldImage);
                    logger.info(`Old image deleted successfully: ${oldImage}`);
                }
            } catch (error) {
                logger.error(
                    `Failed to update product image: ${
                        (error as Error).message
                    }`,
                );
                return next(
                    createHttpError(500, "Failed to update product image"),
                );
            }
        }

        const {
            name,
            description,
            priceConfiguration,
            attributes,
            tenantId,
            categoryId,
            isPublished,
        } = req.body as CreateProductRequest;

        const newProduct: Product = {
            name,
            description,
            priceConfiguration: JSON.parse(priceConfiguration),
            attributes: JSON.parse(attributes),
            tenantId,
            categoryId,
            isPublished,
            image: imageName ? imageName : (oldImage as string),
        };

        await this.productService.updateProduct(productId, newProduct);

        return res.json({
            id: productId,
        });
    };

    getAll = async (req: Request, res: Response) => {
        const { q, tenantId, categoryId, isPublished } = req.query;

        const filters: Filter = {};

        if (isPublished === "true") {
            filters.isPublished = true;
        }

        if (tenantId) {
            filters.tenantId = tenantId as string;
        }
        if (
            categoryId &&
            mongoose.Types.ObjectId.isValid(categoryId as string)
        ) {
            filters.categoryId = new mongoose.Types.ObjectId(
                categoryId as string,
            );
        }

        // add logger
        logger.info(
            `Fetching products with filters: ${JSON.stringify(filters)}`,
        );

        const products = await this.productService.getProducts(
            q as string,
            filters,
            {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
            },
        );

        const finalProducts = (products?.data as Product[]).map(
            (product: Product) => {
                return {
                    ...product,
                    image: this.storage.getObjectUri(product.image),
                };
            },
        );

        res.json({
            data: finalProducts,
            total: products?.total,
            pageSize: products.limit,
            currentPage: products.page,
        });
    };
}

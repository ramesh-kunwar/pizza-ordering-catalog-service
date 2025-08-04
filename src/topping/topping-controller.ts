import { NextFunction, Response, Request } from "express";
import { UploadedFile } from "express-fileupload";
import { v4 as uuidv4 } from "uuid";
import { FileStorage } from "../common/types/storage";
import { CreataeRequestBody, Topping } from "./topping-types";
import { ToppingService } from "./topping-service";
import logger from "../config/logger";
import createHttpError from "http-errors";

export class ToppingController {
    constructor(
        private storage: FileStorage,
        private toppingService: ToppingService,
    ) {}

    create = async (
        req: Request<object, object, CreataeRequestBody>,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const image = req.files!.image as UploadedFile;
            const fileUuid = uuidv4();

            try {
                // Upload image to Cloudinary
                await this.storage.upload({
                    filename: fileUuid,
                    fileData: image.data,
                });

                logger.info(`Image uploaded successfully: ${fileUuid}`);
            } catch (error) {
                logger.error(
                    `Failed to upload image: ${(error as Error).message}`,
                );
                return next(
                    createHttpError(500, "Failed to upload product image"),
                );
            }

            // todo: add error handling
            const savedTopping = await this.toppingService.create({
                ...req.body,
                image: fileUuid,
                tenantId: req.body.tenantId,
            } as Topping);
            // todo: add logging
            res.json({ id: savedTopping._id });
        } catch (err) {
            return next(err);
        }
    };

    get = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const toppings = await this.toppingService.getAll(
                req.query.tenantId as string,
            );

            // todo: add error handling
            const readyToppings = toppings.map((topping) => {
                return {
                    _id: topping._id,
                    name: topping.name,
                    price: topping.name,
                    tenantId: topping.tenantId,
                    image: this.storage.getObjectUri(topping.image),
                };
            });
            res.json(readyToppings);
        } catch (err) {
            return next(err);
        }
    };
}

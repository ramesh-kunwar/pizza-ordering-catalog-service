import config from "config";
import { FileData, FileStorage } from "../types/storage";
import { v2 as cloudinary } from "cloudinary";
import createHttpError from "http-errors";

export class CloudinaryStorage implements FileStorage {
    constructor() {
        // Configure Cloudinary
        cloudinary.config({
            cloud_name: config.get("cloudinary.cloudName"),
            api_key: config.get("cloudinary.apiKey"),
            api_secret: config.get("cloudinary.apiSecret"),
        });
    }

    async upload(data: FileData): Promise<void> {
        try {
            // Convert ArrayBuffer to Buffer
            const buffer = Buffer.from(data.fileData);

            // Upload to Cloudinary using upload_stream
            await new Promise((resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            public_id: data.filename,
                            folder: "products", // Optional: organize images in a folder
                            resource_type: "image",
                            format: "webp", // Convert to WebP for better performance
                            transformation: [
                                { quality: "auto" },
                                { fetch_format: "auto" },
                            ],
                        },
                        (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        },
                    )
                    .end(buffer);
            });
        } catch (error) {
            throw createHttpError(
                500,
                `Failed to upload image to Cloudinary: ${
                    (error as Error).message
                }`,
            );
        }
    }

    async delete(filename: string): Promise<void> {
        try {
            // Delete from Cloudinary using the public_id (filename)
            await cloudinary.uploader.destroy(`products/${filename}`);
        } catch (error) {
            throw createHttpError(
                500,
                `Failed to delete image from Cloudinary: ${
                    (error as Error).message
                }`,
            );
        }
    }

    getObjectUri(filename: string): string {
        try {
            const cloudName = config.get("cloudinary.cloudName");

            if (typeof cloudName !== "string") {
                throw createHttpError(
                    500,
                    "Invalid Cloudinary cloud name configuration",
                );
            }

            // Generate Cloudinary URL with optimizations
            return cloudinary.url(`products/${filename}`, {
                secure: true,
                format: "webp",
                quality: "auto",
                fetch_format: "auto",
            });
        } catch (error) {
            throw createHttpError(
                500,
                `Failed to generate Cloudinary URL: ${
                    (error as Error).message
                }`,
            );
        }
    }
}

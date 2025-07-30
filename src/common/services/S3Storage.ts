import config from "config";
import { FileData, FileStorage } from "../types/storage";
import {
    DeleteObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import createHttpError from "http-errors";

export class S3Storage implements FileStorage {
    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            // region:
            region: config.get("s3.region"),
            credentials: {
                accessKeyId: config.get("s3.accessKeyId"),
                secretAccessKey: config.get("s3.secretAccessKey"),
            },
        });
    }

    async upload(data: FileData): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: data.filename,
            Body: data.fileData,
        };

        // todo: add proper filedata type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new PutObjectCommand(objectParams));
    }

    async delete(filename: string): Promise<void> {
        const objectParams = {
            Bucket: config.get("s3.bucket"),
            Key: filename,
        };

        // todo: add proper filedata type
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return await this.client.send(new DeleteObjectCommand(objectParams));
    }

    getObjectUri(filename: string): string {
        const bucket = config.get("s3.bucket");
        const region = config.get("s3.region");

        if (typeof bucket !== "string" || typeof region !== "string") {
            const error = createHttpError(
                500,
                "Invalid S3 bucket or region configuration",
            );
            throw error;
        }
        return `https://${bucket}.s3.${region}.amazonaws.com/${filename}`;
    }
}

import config from "config";
import { FileData, FileStorage } from "../types/storage";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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

    delete() {
        // Implement S3 object deletion
    }
    // getObjectUri(filename: string): void {
    //     // Implement S3 object URI retrieval
    //     // return Promise.resolve();
    // }

    getObjectUri() {
        //
    }
}

import mongoose from "mongoose";

export interface CreateProductRequest {
    name: string;
    description: string;
    priceConfiguration: string; // JSON string that will be parsed
    attributes: string; // JSON string that will be parsed
    tenantId: string;
    categoryId: string;
    isPublished?: boolean;
}

export interface Product {
    name: string;
    description: string;
    priceConfiguration: unknown; // Parsed JSON object
    attributes: unknown; // Parsed JSON object
    tenantId: string;
    categoryId: string;
    image: string;
    isPublished?: boolean;
}

export interface Filter {
    tenantId?: string;
    categoryId?: mongoose.Types.ObjectId;
    isPublished?: boolean;
}

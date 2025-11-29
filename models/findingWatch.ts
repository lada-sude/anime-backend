import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";


export interface IFindingWatch extends Document {
id: string;
title: string;
image: string;
episode: number;
note?: string;
createdAt: string;
}


const FindingWatchSchema = new Schema<IFindingWatch>({
id: { type: String, default: uuidv4 },
title: { type: String, required: true },
image: { type: String, required: true },
episode: { type: Number, default: 1 },
note: { type: String, default: "" },
createdAt: { type: String, default: () => new Date().toISOString() },
});


export const FindingWatchModel = mongoose.model<IFindingWatch>(
"FindingWatch",
FindingWatchSchema
);
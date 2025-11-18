import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IMerch extends Document {
  id: string;
  title: string;
  image: string;
  price: string;
  rating?: number;
  link: string;
  storeName?: string;
  createdAt: string;
}

const MerchSchema = new Schema<IMerch>({
  id: { type: String, default: uuidv4 },
  title: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: String, required: true },
  rating: { type: Number, default: 0 },
  link: { type: String, required: true },
  storeName: { type: String, default: "" },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const MerchModel = mongoose.model<IMerch>("Merch", MerchSchema);

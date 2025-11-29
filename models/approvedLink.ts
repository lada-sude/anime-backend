//approvedlink.ts
import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IEpisodeLink {
  episode?: number;
  url: string;
  siteName?: string;
}

export interface IApprovedLink extends Document {
  id: string;
  animeTitle: string;
  animeId?: string;
  links: IEpisodeLink[];
  createdAt: string;
}

const EpisodeLinkSchema = new Schema<IEpisodeLink>({
  episode: { type: Number },
  url: { type: String, required: true },
  siteName: { type: String, default: "" },
});

const ApprovedLinkSchema = new Schema<IApprovedLink>({
  id: { type: String, default: uuidv4 },
  animeTitle: { type: String, required: true },
  animeId: { type: String, default: "" },
  links: { type: [EpisodeLinkSchema], default: [] },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

export const ApprovedLinkModel = mongoose.model<IApprovedLink>("ApprovedLink", ApprovedLinkSchema);

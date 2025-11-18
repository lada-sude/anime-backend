import express from "express";
import { FindingWatchModel } from "../models/findingWatch";
import { verifyToken } from "../utils/authMiddleware";
import { requireAdmin } from "./adminHelpers";

const findingRouter = express.Router();

// Public: list
findingRouter.get("/", async (req, res) => {
  try {
    const items = await FindingWatchModel.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("FindingWatch list error:", err);
    res.status(500).json({ error: "Failed to fetch" });
  }
});

// Admin: create
findingRouter.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { title, image, note } = req.body;
    if (!title || !image) return res.status(400).json({ error: "Missing fields" });
    const f = new FindingWatchModel({ title, image, note });
    await f.save();
    res.json({ success: true, item: f });
  } catch (err) {
    console.error("Create finding error:", err);
    res.status(500).json({ error: "Failed to create" });
  }
});

// Admin: update
findingRouter.put("/:id", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await FindingWatchModel.findOneAndUpdate({ $or: [{ id }, { _id: id }] }, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json({ success: true, item: updated });
  } catch (err) {
    console.error("Update finding error:", err);
    res.status(500).json({ error: "Failed to update" });
  }
});

export default findingRouter;

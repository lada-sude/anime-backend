import express from "express";
import { MerchModel } from "../models/merch";

const merchRouter = express.Router();

// Get all merch
merchRouter.get("/", async (req, res) => {
  try {
    const items = await MerchModel.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Failed to fetch merch:", err);
    res.status(500).json({ error: "Failed to fetch merch" });
  }
});

// Create new merch
merchRouter.post("/", async (req, res) => {
  try {
    const { title, image, price, rating, link, storeName } = req.body;
    if (!title || !image || !price || !link) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const merch = new MerchModel({ title, image, price, rating, link, storeName });
    await merch.save();
    res.json({ success: true, merch });
  } catch (err) {
    console.error("Failed to save merch:", err);
    res.status(500).json({ error: "Failed to save merch" });
  }
});

// Update merch
merchRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MerchModel.findOneAndUpdate(
      { id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Merch not found" });
    res.json({ success: true, merch: updated });
  } catch (err) {
    console.error("Failed to update merch:", err);
    res.status(500).json({ error: "Failed to update merch" });
  }
});

// Delete merch
merchRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await MerchModel.findOneAndDelete({ id });
    if (!removed) return res.status(404).json({ error: "Merch not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Failed to delete merch:", err);
    res.status(500).json({ error: "Failed to delete merch" });
  }
});

export default merchRouter;

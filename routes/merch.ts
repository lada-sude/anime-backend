import express from "express";
import { MerchModel } from "../models/merch";
import { verifyToken } from "../utils/authMiddleware"; // keep token verification

const merchRouter = express.Router();

// Public: list all merch
merchRouter.get("/", async (req, res) => {
  try {
    const items = await MerchModel.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error("Merch list error:", err);
    res.status(500).json({ error: "Failed to fetch merch" });
  }
});

// Authenticated: create merch (no admin check)
merchRouter.post("/", verifyToken, async (req, res) => {
  try {
    const { title, image, price, rating, link, storeName } = req.body;
    if (!title || !image || !price || !link) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const m = new MerchModel({ title, image, price, rating, link, storeName });
    await m.save();
    res.json({ success: true, merch: m });
  } catch (err) {
    console.error("Create merch error:", err);
    res.status(500).json({ error: "Failed to create merch" });
  }
});

// Authenticated: update merch
merchRouter.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await MerchModel.findOneAndUpdate(
      { $or: [{ id }, { _id: id }] },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Merch not found" });
    res.json({ success: true, merch: updated });
  } catch (err) {
    console.error("Update merch error:", err);
    res.status(500).json({ error: "Failed to update merch" });
  }
});

// Authenticated: delete merch
merchRouter.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await MerchModel.findOneAndDelete({ $or: [{ id }, { _id: id }] });
    if (!removed) return res.status(404).json({ error: "Merch not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("Delete merch error:", err);
    res.status(500).json({ error: "Failed to delete merch" });
  }
});

export default merchRouter;

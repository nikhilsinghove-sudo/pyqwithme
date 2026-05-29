import { Poem } from "../models/Poem.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @desc    Get all motivational poems
// @route   GET /api/poems
// @access  Public
export const getPoems = asyncHandler(async (_req, res) => {
  const poems = await Poem.find().sort({ createdAt: -1 });
  res.json({ poems });
});

// @desc    Create a new motivational poem
// @route   POST /api/poems
// @access  Admin Private
export const createPoem = asyncHandler(async (req, res) => {
  const { content, author } = req.body;
  if (!content?.trim()) {
    const error = new Error("Poem content is required");
    error.statusCode = 400;
    throw error;
  }
  const poem = await Poem.create({ content: content.trim(), author: author?.trim() || "Anonymous" });
  res.status(201).json({ message: "Poem created successfully", poem });
});

// @desc    Update a motivational poem
// @route   PATCH /api/poems/:id
// @access  Admin Private
export const updatePoem = asyncHandler(async (req, res) => {
  const { content, author } = req.body;
  const poem = await Poem.findById(req.params.id);
  if (!poem) {
    const error = new Error("Poem not found");
    error.statusCode = 404;
    throw error;
  }
  if (content !== undefined) {
    if (!content.trim()) {
      const error = new Error("Poem content cannot be empty");
      error.statusCode = 400;
      throw error;
    }
    poem.content = content.trim();
  }
  if (author !== undefined) poem.author = author.trim() || "Anonymous";
  await poem.save();
  res.json({ message: "Poem updated successfully", poem });
});

// @desc    Delete a motivational poem
// @route   DELETE /api/poems/:id
// @access  Admin Private
export const deletePoem = asyncHandler(async (req, res) => {
  const poem = await Poem.findById(req.params.id);
  if (!poem) {
    const error = new Error("Poem not found");
    error.statusCode = 404;
    throw error;
  }
  await poem.deleteOne();
  res.json({ message: "Poem deleted successfully" });
});

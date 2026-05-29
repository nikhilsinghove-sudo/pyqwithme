import mongoose from "mongoose";

const poemSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: String, default: "Anonymous" }
  },
  { timestamps: true }
);

export const Poem = mongoose.model("Poem", poemSchema);

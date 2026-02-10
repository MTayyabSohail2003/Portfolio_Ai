import mongoose from "mongoose";

export interface IBlog extends mongoose.Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML/Markdown
  tags: string[];
  published: boolean;
  featured: boolean;
  publishedAt: Date;
  author: string;
  readTime: string; // e.g. "5 min read"
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new mongoose.Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for this blog."],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, "Please provide an excerpt"],
      maxlength: [300, "Excerpt cannot be more than 300 characters"],
    },
    content: {
      type: String,
      required: [true, "Please provide content"],
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: String,
      default: "Muhammad Tayyab Sohail",
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Blog ||
  mongoose.model<IBlog>("Blog", BlogSchema);

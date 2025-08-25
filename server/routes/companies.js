import express from "express";
import Company from "../models/Company.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

/**
 * 🔍 Build dynamic Mongo filters from query params
 */
const buildFilters = (q) => {
  const {
    search,
    name,
    industry,
    location,
    tag,
    tags,
    sizeMin,
    sizeMax,
    foundedFrom,
    foundedTo,
  } = q;

  const filter = {};

  // Full-text search (faster than regex on large data)
  if (search) {
    filter.$text = { $search: search };
  }

  if (name) filter.name = new RegExp(name, "i");
  if (industry) filter.industry = industry;
  if (location) filter.location = new RegExp(location, "i");

  // Tags (support single + multiple tags)
  const tagList = [];
  if (tags) tagList.push(...tags.split(",").map((t) => t.trim()));
  if (tag) tagList.push(tag);
  if (tagList.length) filter.tags = { $all: tagList };

  // Size filter
  const sizeQuery = {};
  if (sizeMin) sizeQuery.$gte = Number(sizeMin);
  if (sizeMax) sizeQuery.$lte = Number(sizeMax);
  if (Object.keys(sizeQuery).length) filter.size = sizeQuery;

  // Founded year filter
  const foundedQuery = {};
  if (foundedFrom) foundedQuery.$gte = Number(foundedFrom);
  if (foundedTo) foundedQuery.$lte = Number(foundedTo);
  if (Object.keys(foundedQuery).length) filter.foundedYear = foundedQuery;

  return filter;
};

/**
 * 📌 GET /api/companies
 * List companies with filters, sorting & pagination
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { sort = "-createdAt", page = 1, limit = 10 } = req.query;

    const filter = buildFilters(req.query);
    const pageNum = Math.max(1, Number(page));
    const perPage = Math.min(100, Math.max(1, Number(limit)));

    // Sorting
    const sortObj = {};
    sort.split(",").forEach((field) => {
      if (!field) return;
      sortObj[field.startsWith("-") ? field.slice(1) : field] = field.startsWith("-") ? -1 : 1;
    });

    const [items, total] = await Promise.all([
      Company.find(filter)
        .sort(sortObj)
        .skip((pageNum - 1) * perPage)
        .limit(perPage),
      Company.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      meta: {
        total,
        page: pageNum,
        limit: perPage,
        pages: Math.ceil(total / perPage),
      },
    });
  })
);

/**
 * 📌 GET /api/companies/:id
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const item = await Company.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.json({ success: true, data: item });
  })
);

/**
 * 📌 POST /api/companies
 */
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const created = await Company.create(req.body);
    res.status(201).json({ success: true, data: created });
  })
);

/**
 * 📌 PUT /api/companies/:id
 */
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const updated = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.json({ success: true, data: updated });
  })
);

/**
 * 📌 DELETE /api/companies/:id
 */
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }
    res.json({ success: true, data: deleted._id });
  })
);

export default router;

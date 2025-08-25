import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
      index: true,
    },
    location: {
      type: String,
      trim: true,
      index: true,
    },
    size: {
      type: Number,
      min: 1, // must have at least 1 employee
    },
    foundedYear: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear() + 5, // allow near future companies
    },
    website: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^https?:\/\/.+\..+/.test(v); // basic URL validation
        },
        message: (props) => `${props.value} is not a valid URL`,
      },
    },
    description: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      index: true,
      default: [],
    },
  },
  { timestamps: true }
);

// ✅ Full-text search on name, description, tags
companySchema.index({ name: "text", description: "text", tags: "text" });

// ✅ Compound index for filtering
companySchema.index({
  industry: 1,
  location: 1,
  size: 1,
  foundedYear: 1,
});

export default mongoose.model("Company", companySchema);

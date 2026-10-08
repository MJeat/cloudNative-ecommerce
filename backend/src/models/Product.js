import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    dummyId: {
      type: Number,
      unique: true,
    },

    title: {
      type: String,
      required: true,
    },
    description: String,
    category: String,
    price: Number,
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    brand: String,
    thumbnail: String,

    images: [String],
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;

// import "./env.js";
import connectDB from "./db.js";
import Product from "../models/Product.js";

const importProducts = async () => {
  try {
    await connectDB();

    const res = await fetch("https://dummyjson.com/products?limit=0");
    const data = await res.json();

    const products = data.products.map((product) => ({
      dummyId: product.id,
      title: product.title,
      description: product.description,
      category: product.category,
      price: product.price,
      discountPercentage: product.discountPercentage,
      rating: product.rating,
      stock: product.stock,
      brand: product.brand,
      thumbnail: product.thumbnail,
      images: product.images,
    }));

    await Product.deleteMany();

    await Product.insertMany(products);
    console.log(`Successfully imported ${products.length} products!`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to import products:", error);
    process.exit(1);
  }
};

importProducts();

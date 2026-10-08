import Product from "../../models/Product.js";

export const getAllProduct = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, inStock, brand, rating } =
      req.query;

    const query = {};

    if (category) {
      query.category = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (rating) {
      query.rating = {
        $gte: Number(rating),
      };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === "true") {
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query);

    res.status(200).json({
      success: true,
      count: products.length,
      appliedFilters: query,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted",
      data: deletedProduct,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateProduct = async (req,res) => {
  try {
     const { id } = req.params;
     const { title, description, price, discount, rating, stock} = req.body
     const newUpdate = {
      title : title,
      description : description,
      price : price,
      discount : discount,
      rating : rating,
      stock : stock
     }
     const updatedProduct = await Product.findByIdAndUpdate(id, newUpdate, {new:true, runValidators: true})

      if (!updatedProduct) {
      return res.status(404).json({
        message: "No product found!"
      });
      } 

      res.status(200).json({
        message : "Product's updated successfully!",
        updatedProduct
      })

  }catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
}
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export const getOrder = async (req, res) => {
  const { items, shippingAddress } = req.body;
  const orderItems = [];
  let calculatedItems = 0;

  try {
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty!" });
    }

    if (items.some((item) => item.dummyId == null || item.quantity <= 0)) {
      return res.status(400).json({ message: "Invalid cart item" });
    }

    const dummyIds = items.map((item) => item.dummyId);

    const products = await Product.find({
      dummyId: { $in: dummyIds },
    });
    // faster look up
    const productMap = new Map(products.map((p) => [Number(p.dummyId), p]));

    for (const item of items) {
      const product = productMap.get(Number(item.dummyId));

      if (!product) {
        return res.status(400).json({ message: "Product not found!" });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      calculatedItems += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const newOrder = new Order({
      user: req.user.sub,
      items: orderItems,
      shippingAddress,
      totalAmount: calculatedItems,
      status: "pending",
    });

    await newOrder.save();

    await newOrder.populate("user", "name email");
    await newOrder.populate({
      path: "items.product",
      select: "title price thumbnail images",
    });

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.json({
      message: "Successfully ordered!",
      order: newOrder,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const getOrder = await Order.find({ user: req.user.sub })
      .populate({
        path: "items.product",
        select: "title price thumbnail images",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      getOrder,
    });
  } catch (err) {
    res.status(400).json({ message: "server error", error: err.message });
  }
};

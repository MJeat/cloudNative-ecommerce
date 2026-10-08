import Order from "../../models/Order.js";

export const getAllOrders = async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "title thumbnail");

  res.status(200).json({
    orders,
  });
};

export const UpdateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  order.status = status;

  await order.save();

  res.status(200).json({
    message: "Status Change Successfully",
    order,
  });
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  res.status(200).json({
    message: "Delete Order Successfully",
    order,
  });
};

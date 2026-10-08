import express from "express";
import { getOrder, getOrders } from "../controllers/orderController.js"
import { verifyToken } from "../middleware/authMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/", verifyToken ,getOrder);
orderRouter.get("/myOrders",verifyToken,getOrders);

export default orderRouter;

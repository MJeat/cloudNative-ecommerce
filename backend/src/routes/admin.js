import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { getDashboard } from "../controllers/admin/dashboardController.js";
import { getAllOrders, UpdateOrderStatus, deleteOrder } from "../controllers/admin/orderController.js";
import { editUser, getAllUsers, deleteUser } from "../controllers/admin/userController.js";
import { getAllProduct, deleteProduct, updateProduct } from "../controllers/admin/productController.js";

const adminRouter = express.Router();

adminRouter.get("/dashboard", verifyToken, authorize("admin"), getDashboard);
// adminRouter.get("/orders", verifyToken, authorize("admin"), getDashboard);
adminRouter.get("/orders", getAllOrders);
adminRouter.patch("/orders/:id/status", UpdateOrderStatus);
adminRouter.delete("/orders/:id", deleteOrder);
//admin user
adminRouter.get("/users", getAllUsers)
adminRouter.patch("/users/:id", editUser)
adminRouter.delete("/users/:id", deleteUser)
//admin product
adminRouter.get("/products", verifyToken, getAllProduct)
adminRouter.delete("/products/:id", verifyToken, deleteProduct)
adminRouter.patch("/products/:id", verifyToken, updateProduct)

export default adminRouter;

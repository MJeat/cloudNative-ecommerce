import dns from 'node:dns';

// Force Node.js to use IPv4 and Google's Public DNS servers for resolution
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

import "./config/env.js";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import productRouter from "./routes/product.js";
import authRouter from "./routes/auth.js";
import orderRouter from "./routes/order.js";
import adminRouter from "./routes/admin.js"
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import { verifyToken } from "./middleware/authMiddleware.js";

const app = express();

const PORT = process.env.PORT || 3000;

await connectDB();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/products", productRouter);
app.use("/api/auth", authRouter);
app.use("/api/order", orderRouter);
app.use("/api/admin", verifyToken, adminRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

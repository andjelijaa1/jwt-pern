import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import compression from "compression";
import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth-routes.js";
import userRouter from "./routes/user-routes.js";
import { authenticateToken } from "./middleware/authorization.js";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Helmet
app.use(helmet());

// Rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

const authLimiter = rateLimit({
  max: 10,
  windowMs: 15 * 60 * 1000,
  message: "Too many authentication attempts, please try again in 15 minutes!",
});
app.use("/api/auth", authLimiter);

// Cors
const corsOptions = {
  credentials: true,
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
};
app.use(cors(corsOptions));

// Body parser, cookie, xss, compression
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(compression());

// Static
app.use("/", express.static(join(__dirname, "public")));

// Logger za development
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
    next();
  });
}

// Routes
app.use("/api/auth", authRouter);
app.use(authenticateToken);
app.use("/api/users", userRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;

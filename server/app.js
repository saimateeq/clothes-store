import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import routes from "./routes/index.js";
import { stripeWebhook } from "./controllers/paymentController.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Mounted ahead of the global JSON parser below because Stripe's signature
// verification needs the exact raw request body, not parsed JSON.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Strips any request key starting with "$" or containing "." from
// body/query/params — e.g. blocks ?category[$ne]=x from becoming a raw
// { $ne: 'x' } operator inside a Mongoose filter built from query params.
app.use(mongoSanitize());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

app.use("/uploads", express.static("uploads"));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;

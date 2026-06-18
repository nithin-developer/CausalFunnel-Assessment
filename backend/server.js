require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api", analyticsRoutes);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "User Analytics API is running" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

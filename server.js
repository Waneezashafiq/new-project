const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 5000;

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads/profile_images folder exists
const uploadDir = "uploads/profile_images/";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Enable CORS
app.use(cors());

// Serve uploads folder statically
app.use("/uploads", express.static("uploads"));

// Routes
const usersRouter = require("./routes/userRoutes");
app.use("/api/users", usersRouter);

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

require("dotenv").config({ path: __dirname + "/.env" });
console.log("DEBUG URI:", process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const blogRoutes = require("./routes/blogRoutes");
const authRoutes = require("./routes/authRoutes");

connectDB();

const app = express();
app.use(cors({
  origin: "https://daily-diary-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/blogs", blogRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("MERN Blog API Running");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const SECRET = process.env.JWT_SECRET || "secret";

app.post("/register", (req, res) => {
  res.json({ message: "User registered" });
});

app.post("/login", (req, res) => {
  const token = jwt.sign({ user: "test" }, SECRET);
  res.json({ token });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3001, () => console.log("Auth running"));
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());

app.get("/products", (req, res) => {
  res.json([{ id: 1, name: "Product A" }]);
});

app.post("/products", (req, res) => {
  res.json({ message: "Product added" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(3003, () => console.log("Product running"));
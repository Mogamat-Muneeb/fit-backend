const dotenv = require("dotenv");
const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
const users = require("./app/routes/user.routes.js");

const app = express();

dotenv.config();

connect(process.env.MONGO_URL || "")
  .then(() => {
    console.log("Mongo Connection successfully established ✅");
  })
  .catch((error) => {
    console.error("Error connecting to Mongoose 👀", error);
    process.exit(1);
  });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => res.send("FFx Backend"));
app.use("/auth", users);
app.listen(9000, () => console.log("Server ready on port 8080."));

module.exports = app;
const dotenv = require("dotenv");
const express = require("express");
const { connect } = require("mongoose");
const cors = require("cors");
const users = require("./app/routes/user.routes.js");
const posts = require("./app/routes/post.routes.js");

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

app.get("/", (req, res) => res.send("Fit Pro Backend"));
app.use("/auth", users);
app.use("/posts", posts);
app.listen(9000, () => console.log("Server ready on port 9000."));

module.exports = app;
// {
//   "_id": "65e6c0d2d235132c91f4e418",
//   "email": "testaccount@gmail.com",
//   "role": "user",
//   "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NWU2YzBkMmQyMzUxMzJjOTFmNGU0MTgiLCJyb2xlIjoidXNlciIsImlhdCI6MTcwOTYyMjUxOSwiZXhwIjoxNzA5NzA4OTE5fQ.nqQ7ybdTVRJYbHOLivdsMbcvdUrB6SEQ3dfM4-XPoiU"
// }
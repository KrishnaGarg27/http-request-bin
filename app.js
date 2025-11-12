const express = require("express");
const mongoose = require("mongoose");
const app = express();

const { v4: uuid } = require("uuid");
const Bin = require("./models/binModel.js");
const Request = require("./models/requestModel.js");

mongoose
  .connect("mongodb://localhost:27017/http-dump")
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(`Error while connecting to Database - ${err}`);
  });

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// Home Page Route
app.get("/", (req, res) => {
  res.send("This route is the home page");
});

// Bin Creation and Redirection
app.post("/", async (req, res) => {
  const binId = uuid();
  const bin = new Bin({ binId });
  await bin.save();
  res.redirect(`/${binId}`);
});

// Route to store request in Bin
app.use("/:id", async (req, res, next) => {
  const bin = await Bin.findOne({ binId: req.params.id });
  if (!bin) {
    return res.send("Error. Bin does not exist");
  }

  const { method, header, query, body, ip } = req;
  const request = new Request({
    binId: bin._id,
    method,
    header,
    query,
    body,
    ip,
  });
  await request.save();
  next();
});

// Route to get all requests in bin
app.get("/:id", async (req, res) => {
  const binId = req.params.id;
  const bin = await Bin.findOne({ binId: req.params.id });
  const requests = await Request.find({ binId: bin }).sort({ createdAt: 1 });
  res.json(requests);
});

app.all("/:id", (req, res) => {
  res.send("Request has been recorded");
});

app.listen(3000, () => {
  console.log("Listening on Port 3000");
});

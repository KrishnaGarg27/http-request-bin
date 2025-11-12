if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const Bin = require("./models/binModel.js");
const Request = require("./models/requestModel.js");

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log(`Error while connecting to Database - ${err}`);
  });

// Object to store connections to each request bin
const connections = {};

// CORS
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// Bin Creation and Redirection
app.post("/", async (req, res) => {
  const binId = uuid();
  const bin = new Bin({ binId });
  await bin.save();
  res.json(`${binId}`);
});

// Route to get all requests in bin
app.get("/:binId", async (req, res) => {
  // Searching DB for Bin and Requests
  const binId = req.params.binId;
  const bin = await Bin.findOne({ binId });
  if (!bin) {
    return res.send("Bin does not exist");
  }
  const requests = await Request.find({ binDocumentId: bin }).sort({
    createdAt: 1,
  });

  // Setting Up headers for Server-sent events
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Saving res to the active connections array
  if (!connections[binId]) {
    connections[binId] = [];
  }
  connections[binId].push(res);

  // Sending the previously sent requests from the database
  for (request of requests) {
    res.write(`data: ${JSON.stringify(request)}\n\n`);
  }

  // Ending and deleting the connection on Close
  req.on("close", () => {
    connections[binId] = connections[binId].filter(
      (connection) => connection != res
    );
    if (connections[binId].length === 0) {
      delete connections[binId];
    }
    res.end();
  });
});

app.delete("/:binId", async (req, res) => {
  const binId = req.params.binId;
  const bin = await Bin.findOneAndDelete({ binId });
  if (!bin) {
    return res.send("Bin does not exist");
  }
  await Request.deleteMany({ binDocumentId: bin._id });
  res.send("Deleted bin Successfully");
});

// Route to store request in Bin
app.all("/bin/:binId", async (req, res) => {
  const binId = req.params.binId;
  const bin = await Bin.findOne({ binId });
  if (!bin) {
    return res.send("Error. Bin does not exist");
  }

  // Storing request in bin
  const { method, header, query, body, ip } = req;
  const request = new Request({
    binDocumentId: bin._id,
    method,
    header,
    query,
    body,
    ip,
  });
  await request.save();

  // Sending the request to active connections through Server-side events
  if (connections[binId]) {
    connections[binId].forEach((res) => {
      res.write(`data: ${JSON.stringify(request)}\n\n`);
    });
  }

  res.send("Request has been recorded");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});

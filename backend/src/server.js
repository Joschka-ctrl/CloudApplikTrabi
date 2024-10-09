const express = require("express");
const app = express();
const port = 3015;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Trabbis");
});

app.listen(port, () => {
  console.log("Listening on Port: " + port);
});

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

const users = require("./routes/users");
const bathrooms = require("./routes/bathrooms");
const reviews = require("./routes/reviews");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/reviews", reviews);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

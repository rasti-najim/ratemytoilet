const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = 3000;

// Import the consolidated routes file
const routes = require("./routes/routes");  // Assuming you rename your routes.js to be inside a 'routes' directory

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Use the consolidated routes
app.use("/api", routes);  // This will make all routes defined in routes.js accessible under /api

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

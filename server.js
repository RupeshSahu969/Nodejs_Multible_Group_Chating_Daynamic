require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB


const app = require("express")();

// Mount userRoute on the root path
const userRoute = require("./routes/userRoute");


// app.get("/", (req, res) => {
//     res.send("Hello World!");
//   });

app.use("/", userRoute);

const PORT = 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

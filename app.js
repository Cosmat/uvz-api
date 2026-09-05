const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const authRoutes = require("./routes/auth.routes")
var cors = require("cors")
const keys = require("./keys")
const app = express()

app.use(cors({
  origin: ['http://rabota-nt.ru', 'http://rabota-nt.ru:8080', 'http://localhost:8080', 'https://uvz-front.onrender.com'],
  credentials: true
}))
app.use(bodyParser.json())

app.use(authRoutes)

mongoose
  .connect(keys.MONGO_URI, {
  })
  .then(() => console.log("MongoDB sucsessfuly connected"))
  .catch((error) => console.error(error))
  console.log('MONGO_URI:', keys.MONGO_URI)


const Deshife = require("./models/deshife.model");

mongoose.connection.on("connected", async () => {
  console.log("DB:", mongoose.connection.name, mongoose.connection.host, mongoose.connection.port);
  console.log("deshife count:", await Deshife.countDocuments());
});
module.exports = app
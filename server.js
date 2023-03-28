const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const expressLayouts = require("express-ejs-layouts")

const mongoose = require("mongoose")

mongoose.connect(process.env.DATABASE_URL).then(() => console.log("connected to mongoose"))

app.set("view engine", "ejs")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.static("public"))

const indexRouter = require("./routes/index")
app.use("/", indexRouter)

app.listen(3000, () => console.log("listening on 3000"))




const express = require("express")
const app = express()
const dotenv = require("dotenv").config()
const methodOverride = require("method-override")
const expressLayouts = require("express-ejs-layouts")

const indexRouter = require("./routes/index")
const authorsRouter = require("./routes/authors")
const bookRouter = require("./routes/books")

const mongoose = require("mongoose")
mongoose.connect(process.env.DATABASE_URL).then(() => console.log("connected to mongoose"))

app.set("view engine", "ejs")
app.set("layout", "layouts/layout")
app.use(expressLayouts)
app.use(express.static("public"))
app.use(express.urlencoded({extended: false}))
app.use(methodOverride("_method"))

app.use("/", indexRouter)
app.use("/authors", authorsRouter)
app.use("/books", bookRouter)


app.listen(3000, () => console.log("listening on 3000"))

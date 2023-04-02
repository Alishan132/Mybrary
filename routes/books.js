const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")

const Book = require("../models/book")
const Author = require("../models/author")

const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const uploadPath = path.join("public", Book.coverImageBasePath)
const upload = multer({
    dest: uploadPath,
    fileFilter : (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// All Books Route
router.get("/", async(req, res) => {
    let query =  Book.find()

    if(req.query.title != null && req.query.title != ""){
        query = query.regex("title", new RegExp(req.query.title, "i"))
    }

    if(req.query.publishedBefore != null && req.query.publishedBefore != ""){
        query = query.lte("publishDate", req.query.publishedBefore)
    }

    if(req.query.publishedAfter != null && req.query.publishedAfter != ""){
        query = query.gte("publishDate", req.query.publishedAfter)
    }

    try{
        const books = await query.exec()
        res.render("books/index", {books : books, searchOptions : req.query, coverImageBasePath: Book.coverImageBasePath})
    }catch{
        res.redirect("/")
    }
})

// New Book Route 
router.get("/new", async (req, res) => {
    try{
        const authors = await Author.find()
        const book = new Book()
        res.render("books/new", {book : book, authors : authors}) 
    }catch{
        res.redirect("/books")
    }
})

// Create Book Route
router.post("/", upload.single("cover") ,async(req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const authors = await Author.find()
    const book = new Book({
        title : req.body.title,
        author : req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        coverImageName : fileName,
        description : req.body.description,
    })

    try{
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('/books')
    }catch (err){
        console.log(err)
        console.log("fileName", req.file)
        res.render("books/new", {book : book, authors : authors})
    }
})

module.exports = router
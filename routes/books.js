const express = require("express")
const router = express.Router()

const Book = require("../models/book")
const Author = require("../models/author")

// All Books Route
router.get("/", async(req, res) => {
    let query = Book.find()

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
router.post("/", async(req, res) => {
    const authors = await Author.find()
    const book = new Book({
        title : req.body.title,
        author : req.body.author,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        description : req.body.description,
    })
    saveCover(book, req.body.cover)

    try{
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect('/books')
    }catch (err){
        console.log(err)
        res.render("books/new", {book : book, authors : authors})
    }
})

function saveCover(book, coverEncoded) {
    if(coverEncoded == null) return 
    const cover = JSON.parse(coverEncoded)
    if(cover != null) {
        book.coverImageType = cover.type
        book.coverImage = new Buffer.from(cover.data, "base64")
    }
}

module.exports = router
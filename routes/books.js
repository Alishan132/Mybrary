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
    renderFormPage(res, new Book(), "new")
})

router.get("/:id", async(req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate("author").exec()
        res.render("books/show", {book : book})
    }catch{
        res.redirect('/')
    }
})

// Create Book Route
router.post("/", async(req, res) => {
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
        res.redirect('/books')
    }catch (err){
        renderFormPage(res, book, "new" , true)
    }
})

router.get("/:id/edit", async(req, res) => {
    try{
        const book = await Book.findById(req.params.id)
        renderFormPage(res, book, "edit")    
    }catch(err){
        console.log(err)
        res.redirect("/books")
    }
})

router.put("/:id", async(req, res) => {
    console.log(req.body)
    let book
    try{
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        book.description = req.body.description

        if(req.body.cover != null && req.body.cover != ""){
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    }catch{
        if(book != null){
            renderFormPage(res, book, "edit", true)
        }else{
            res.redirect("/")
        }
    }
})

router.delete("/:id", async(req, res) => {
    let book
    try {
        book = await Book.findByIdAndRemove(req.params.id)
        res.redirect("/books")
    } catch {
        if(book != null){
            res.render(`/books/${book.id}`, {book : book, errMessage : "Error Removing Book"})
        }else{
            res.redirect("/")
        }
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

async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find()
        let params = {
            authors : authors,
            book : book
        }
        if(hasError){
            if (form === "edit") params.errMessage = "Error Updating Book"
            else params.errMessage = "Error Creating Book"
        }
        res.render(`books/${form}`, params) 
    }catch{
        res.redirect("/books")
    }
}

module.exports = router
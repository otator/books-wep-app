"use strict";

const express = require("express");
require("dotenv").config();

const server = express();
const pg = require("pg");
// Database Setup
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PORT = process.env.PORT || 3030;

server.use(express.static("./public"));

const superagent = require("superagent");
server.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override');
server.set("view engine", "ejs");
server.use(methodOverride('_method'));
const lorem ="No discription available";

// https://www.googleapis.com/books/v1/volumes?q=search+terms
let arrOfBooks = [];
server.get("/test", (req, res) => {
  // const URL = " https://www.googleapis.com/books/v1/volumes?q=cat";
  // superagent.get(URL)
  // .then(data=>{
  //   res.json(data.body);
  // })
  // res.send("Working")
  // res.render('pages/index');
  res.render("pages/searches/new");
});

server.post("/searches", (req, res) => {
  let query = req.body.titleOrAuthor;
  // console.log(query);
  let option = req.body.option;
  // console.log(option);
  // let arrOfBooks = [];
  const URL = `https://www.googleapis.com/books/v1/volumes?q=${query}`;
  // const URL = `https://www.googleapis.com/books/v1/volumes?q=${option}:${query}`;

  // console.log(URL);
  superagent
    .get(URL)
    .then((data) => {
      arrOfBooks = data.body.items.map((value) => new Book(value));
      res.render("pages/searches/show", { singleDataBooks: arrOfBooks });
    })
    .catch((error) => {
      console.log(`Error in getting data from Google API`, error.message);
    });
});

function Book(obj) {
  // console.log(obj.volumeInfo.imageLinks.smallThumbnail);
  this.img_url = obj.volumeInfo.hasOwnProperty("imageLinks")
    ? obj.volumeInfo.imageLinks.smallThumbnail
    : "https://i.imgur.com/J5LVHEL.jpg";
  this.title = obj.volumeInfo.hasOwnProperty("title")
    ? obj.volumeInfo.title
    : "No Title";
  this.author = obj.volumeInfo.hasOwnProperty("authors")
    ? obj.volumeInfo.authors.join(' and ')
    : "No Author";
  this.description = obj.volumeInfo.hasOwnProperty("description")
    ? obj.volumeInfo.description
    : lorem;
  this.isbn = obj.volumeInfo.industryIdentifiers[0].hasOwnProperty("identifier")
    ? obj.volumeInfo.industryIdentifiers[0].identifier
    : "No ISBN";
  // console.log(obj.volumeInfo.categories);
  this.bookShelf = obj.volumeInfo.hasOwnProperty("categories")
    ? obj.volumeInfo.categories[0]
    : "No Category";
}

server.get("/", (req, res) => {
  let SQL = `SELECT * FROM books;`;

  client.query(SQL).then((result) => {
    // console.log("sa;", result.rows);
    if (result.rows.length) {
      // console.log(result.rows);
      res.render("pages/index", { books: result.rows });
    }else{
      // res.send("No Books in your Book Shelf");
      res.render("pages/index2",{books: result.rows});
    }
    // else {
    //   // res.render("pages/index", { data: result.rows });
    // }
    // res.render("pages/index");
  });
});

server.get("/books/:id", (req, res) => {
  let SQL = `SELECT * FROM books where id = ${req.params.id};`;

  client.query(SQL).then((singleData) => {
    // console.log(singleData.rows);
    res.render("pages/books/details", { singleDataBooks: singleData.rows });
  });

  // res.redirect("pages/searches/show");
});

server.post("/addtoDB", (req, res) => {
  // console.log(req.body.obj);
  let obj = arrOfBooks[Number(req.body.obj)];
  // console.log(obj.title);

  let SQL = `INSERT INTO books (img_url , title, author, descriptions, isbn,bookshelf) VALUES($1,$2,$3,$4,$5,$6) RETURNING id;`;
  let safeValues = [obj.img_url, obj.title, obj.author, obj.description, obj.isbn, obj.bookShelf ];
  // console.log(arrOfBooks[Number(req.body.obj)]);
  client.query(SQL, safeValues)
  .then(result=>{
    // console.log('I got your results');
    // console.log(result.rows);

    res.redirect(`/books/${result.rows[0].id}`);
  })
  .catch(error=>{
    console.log("Error in add to bookshelf", error.message);
  })

});


server.put('/updateData/:_isbn', (req, res)=>{
  // console.log("put" , req.body);
  console.log(req.params);
  let {img_url, title, author, isbn, description} = req.body;
  let safeValue = [img_url, title, author, isbn, description, req.params._isbn ];
  let sql = 'UPDATE BOOKS SET img_url = $1, title = $2, author = $3, isbn = $4, descriptions = $5 WHERE isbn = $6 RETURNING id;';
  
  client.query(sql, safeValue)
  .then((result)=>{
    let id = result.rows[0].id;
    res.redirect(`/books/${id}`);
  })
  .catch(error=>{
    console.log("Error in updating data", error.message);
  });

});


server.delete('/deleteData/:_isbn', (req, res)=>{
  let sql = "DELETE FROM books WHERE isbn = $1;";
  // let _isbn = req.params._isbn;
  //convert the isbn to string in order to delete it from the table
  let value = [req.params._isbn+""];
  client.query(sql, value)
  .then(()=>{
    res.redirect('/');
  })
  .catch(error =>{
    console.log("Error in deleting row", error.message);
  })

})






server.get("*", (req, res) => {
  // res.status(404).send('<img style="background-size:cover;" src="">');
  let imgUrl =
    "https://i2.wp.com/learn.onemonth.com/wp-content/uploads/2017/08/1-10.png?w=845&ssl=1";
  res.render("pages/error", { err: imgUrl });
});

client.connect().then(() => {
  server.listen(PORT, (req, res) => {
    console.log(`Listening on  PORT ${PORT} ...`);
  });
});

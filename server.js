"use strict";

const express = require("express");
require("dotenv").config();

const server = express();
const pg = require("pg");
// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
// const client = new pg.Client({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false },
// });

const PORT = process.env.PORT || 3030;

server.use(express.static("./public"));

const superagent = require("superagent");
server.use(express.urlencoded({ extended: true }));

server.set("view engine", "ejs");
const lorem =
  "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Excepturi, accusamus sed asperiores, dignissimos provident in earum veniam dolorem, aperiam perferendis sapiente. Illo ad commodi distinctio consectetur molestias suscipit, dignissimos facilis?";

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
    ? obj.volumeInfo.authors
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
  let SQL = `SELECT * FROM books`;

  client.query(SQL).then((result) => {
    // console.log("sa;", result.rows);
    if (result.rows.length) {
      // console.log(result.rows);
      res.render("pages/index", { books: result.rows });
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
    console.log(singleData.rows);
    res.render("pages/books/details", { singleDataBooks: singleData.rows });
  });

  // res.redirect("pages/searches/show");
});

server.post("/addtoDB", (req, res) => {
  // console.log(req.body.obj);

  let SQL = `INSERt INTO books (img_url , title, author, descriptions, isbn,bookshelf) VALUES($1,$2,$3,$4,$5,$6);`;
  // let safeValues = [];
  console.log(arrOfBooks[Number(req.body.obj)]);
});
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

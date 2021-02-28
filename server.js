'use strict'

const express = require('express');
require('dotenv').config();

const server = express();

const PORT = process.env.PORT || 3030;

server.use(express.static('./public'));

const superagent = require('superagent')

server.set('view engine', 'ejs');


// https://www.googleapis.com/books/v1/volumes?q=search+terms

server.get('/test',(req, res)=>{
  const URL = " https://www.googleapis.com/books/v1/volumes?q=cat";
  // superagent.get(URL)
  // .then(data=>{
  //   res.json(data.body);
  // })
  // res.send("Working")
  res.render('pages/index');
})





server.listen(PORT, (req, res)=>{
  console.log(`Listening on  PORT ${PORT} ...`);
})
/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection('books').find({"_id": {$exists: true}, "title": {$exists: true}}).toArray((err, data) => {
          return res.json(data);
        });
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title == null || title == '') {
        return res.status(400).send('missing book title');
      }
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection("books").insertOne({"title": title, "commentcount": 0, "comments": []}, (err, data) => {
          return res.json({_id: data.insertedId, 'title': title});
        });
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
       try {
          var bookid = ObjectId(req.params.id);
        }
        catch(err) {
          return res.status(400).send('id error')
        }
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection('books').findOneAndDelete({_id: bookid}, (err, result) => {
        if (err) throw err;
        if (result.value) {
          return res.status(200).send('complete delete successful');
        }
        else {
          return res.status(400).send('does not exist');
        }
      })
      })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
    try {
      var bookid = ObjectId(req.params.id);
    }
    catch(err) {
      return res.status(400).send('does not exist')
    }
      
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection('books').find({"_id": ObjectId(bookid)}).toArray((err, data) => {
          if (data == "" || data == undefined || data == null) {
            return res.send("does not exist");
          }
          const newObj = {
            "_id": bookid,
            "title": data[0].title,
            "comments": data[0].comments
          }
          const newArr = [newObj];
          return res.json(newArr);
        })
      })
    })
    
    .post(function(req, res){
      try {
        var bookid = ObjectId(req.params.id);
      }
      catch(err) {
        res.status(400).send('id error')
      }
      var comment = req.body.comment;
      //json res format same as .get
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection('books').findOneAndUpdate({_id: bookid}, {$inc: {commentCount: 1}, $push: {comments: {comment} } }, {returnOriginal: false}, (err, result) => {
        if (err) throw err;
        if (result.value) {
          return res.status(200).json(result.value);
        }
        else {
          return res.status(400).send('does not exist');
        }
      })
      });
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        db.collection('books').deleteMany({}, (err, result) => {
          if (err) throw err;
          return res.status(200).send('delete successful');
      })
      })
    });
  
};

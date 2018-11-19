/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      var project = req.params.project;
      var query = req.query;
      // console.log(query);
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        var collection = db.collection(project);
        collection.find(query).toArray((err, doc) => res.json(doc))
      });
    })
    
    .post(function (req, res){
      var project = req.params.project;
      var issue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_on: new Date(),
        updated_on: new Date(),
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        open: true,
        status_text: req.body.status_text || ''
      };
      if (!issue.issue_title || !issue.issue_text || !issue.created_by) return res.send('Missing required inputs');
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        var collection = db.collection(project);
        collection.insertOne(issue, (err, doc) => {
          issue._id = doc.insertedId;
          res.json(issue)
        });
      });
    })
    
    .put(function (req, res){
      var project = req.params.project;
      var id = req.body._id;
      delete req.body._id;                                                                                       // so that updatedData would not include the _id that is immutable
      var updatedData = req.body;
      for (var ele in updatedData) { if (!updatedData[ele]) delete updatedData[ele] };                           // gets rid of blank entries in updatedData
      if (Object.keys(updatedData).length < 1) return res.send('No updated fields sent');
      updatedData.updated_on = new Date();
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        var collection = db.collection(project);
        collection.findOneAndUpdate({_id: new ObjectId(id)}, {$set: updatedData}, {new: true}, (err, doc) => {
          (!err) ? res.send('successfully updated') : res.send('could not update '+id+' '+err);
          // console.log(doc.value);
        });
      });
    })
    
    .delete(function (req, res){
      var project = req.params.project;
      var id = req.body._id;
      if (!id) return res.send('_id error or missing');
      MongoClient.connect(CONNECTION_STRING, (err, db) => {
        var collection = db.collection(project);
        collection.findAndRemove({_id: new ObjectId(id)}, (err, doc) => {
          (!err) ? res.send('deleted '+id) : res.send('could not delete '+id+' '+err)
        });
      });
    });
    
};

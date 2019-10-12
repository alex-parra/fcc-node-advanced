'use strict';

const fccTesting  = require('./freeCodeCamp/fcctesting.js');

const express     = require('express');
const bodyParser  = require('body-parser');
const mongo = require('mongodb').MongoClient;

const auth = require('./auth.js');
const routes = require('./routes.js');

const app = express();

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'pug');

mongo.connect(process.env.DATABASE, (err, client) => {
  if(err) {
    console.log('Database error: ' + err);
    return;
  }

  console.log('Successful database connection');
  const db = client.db('advanced-node');
  
  auth(app, db);
  routes(app, db);
  
  app.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port " + process.env.PORT);
  });

});

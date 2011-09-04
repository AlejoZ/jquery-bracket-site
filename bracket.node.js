var express = require('express')
var app = express.createServer();

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://127.0.0.1/bracket');

app.use(express.bodyParser());

app.get('/', function(req, res){
    res.send('Hello World');
    });


var results16 = {  
    teams : [
      ["Team 1",  "Team 2" ],
      ["Team 3",  "Team 4" ],
      ["Team 5",  "Team 6" ],
      ["Team 7",  "Team 8" ],
      ["Team 11", "Team 12"],
      ["Team 13", "Team 14"],
      ["Team 15", "Team 16"],
      ["Team 17", "Team 18"]
    ],
    results : [[
      [[2, 1], [2, 1], [2, 1], [2, 1], [1, 2], [1, 2], [1, 2], [1, 2]],
      [[1, 2], [3, 4], [5, 6], [7, 8]],
      [[9, 10], [11, 12]],
      [[16, 14]]
    ], [
      [[5, 1],[1, 2],[1, 2],[1, 2]],
      [[8, 2],[1, 2],[1, 2],[1, 2]],
      [[1, 2],[1, 2]],
      [[3, 2],[6, 2]],
      [[3, 2]],
      [[1, 2]]
    ], [
      [[3, 2]]
    ]]
  };

var results8 = {  
    teams : [
      ["Team 1",  "Team 2" ],
      ["Team 3",  "Team 4" ],
      ["Team 5",  "Team 6" ],
      ["Team 7",  "Team 8" ]
    ],
    results : [[
      [[2, 1], [2, -1], [2, 0], [NaN, NaN]],
      [[2, 1], [NaN, NaN]],
    ], [
      [[2, 1], [NaN, NaN], [1, 2]],
      [[NaN, NaN], [NaN, NaN], [0, 1]]
    ]]
  };

var results4 = {  
    teams : [
      ["Team 1",  "Team 2" ],
      ["Team 3",  "Team 4" ]
    ],
    results : [[
      [[2, 1], [NaN, NaN]],
      [[NaN, NaN]],
    ], [
      [[NaN, NaN]]
    ]]
  };

app.get('/get/:id([0-9]+)', function(req, res){
    var id = req.param('id')
    console.log('get: '+id)
    res.json([results4, results8, results16][id]);
  });

app.post('/set/:id([0-9]+)', function(req, res){
    req.accepts('application/json');
    console.log('set: '+req.param('id'))
    console.log(req.body)
    res.send('', 200)
  });

/*
app.get('/send', function (req, res) {
  var News = db.model('News');
    res.send(News.getLatest());
    });

News.statics.getLatest = function (callback) {
  var promise = new Promise;
  if (callback) promise.addBack(callback);
  this.find({ datePublished: { $gt: new Date(Date.now() - 60000*60) } },
  promise.resolve.bind(promise));
  return promise;
};
*/

/*
// Define Model
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name : String,
    age : String
});

mongoose.model('Document', UserSchema);
var User = mongoose.model('Document');

var user = new User();

user.name = 'Jim';
user.age = '27';
user.save(function(err, user_Saved){
    if(err){
        throw err;
        console.log(err);
    }else{
        console.log('saved!');
    }
});
*/

app.listen(3000);


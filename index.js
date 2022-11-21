const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const createAndSaveUser = require('./schema').createAndSaveUser;
const createAndSaveExercise = require('./schema').createAndSaveExercise;
const findUsername = require('./schema').findUsername;
const findAllUsername = require('./schema').findAllUsername;
const findlogs = require('./schema').findlogs;
require('dotenv').config()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(`mongodb+srv://alialghanay:03541514@cluster.qdcdggp.mongodb.net/trucker?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });

// You can POST to /api/users with form data username to create a new user.

// The returned response from POST /api/users,
// with form data username will be an object with username and _id properties.

app.post('/api/users', (req, res) => {
  const { username } = req.body;
  findUsername(username, (err, d) => {
    if(err) {
      console.log(err);
    }else if(d === null) {
      createAndSaveUser(username, (err, d) => {
        if(err) {
          console.error(err);
        }else {
          res.json({username: d.username, _id:d._id});
        }
      });
    }else {
      res.json({username: d.username, _id:d._id});
    }
  })
})

// You can make a GET request to /api/users to get a list of all users.

// The GET request to /api/users returns an array.

// Each element in the array returned from GET /api/users,
// is an object literal containing a user's username and _id.

app.get('/api/users', (req, res) => {
  findAllUsername((err, d) => {
    if(err) {
      console.log(err);
    }else if(d === null) {
    }else {
      res.json(d);
    }
  })
})

// You can POST to /api/users/:_id/exercises with form data description,
// duration, and optionally date. If no date is supplied,
// the current date will be used.

// The response returned from POST /api/users/:_id/exercises,
// will be the user object with the exercise fields added.

app.post('/api/users/:_id/exercises', (req, res) => {
  var { _id } = req.params;
  var { description } = req.body;
  var { duration } = req.body;
  var { date } = req.body;
  createAndSaveExercise([_id, description, duration, date], (err, d) => {
    if(err) {
      console.error(err);
    }else {
      res.json({
        _id: d[0]._id,
        username: d[0].username,
        description: d[1].description,
        duration: d[1].duration,
        date: d[1].date
      })
    }
  })
})

// You can make a GET request to /api/users/:_id/logs,
// to retrieve a full exercise log of any user.

// A request to a user's log GET /api/users/:_id/logs,
// returns a user object with a count property representing the number of exercises
// that belong to that user.

// A GET request to /api/users/:_id/logs will return:
// the user object with a log array of all the exercises added.

// Each item in the log array that is returned from GET /api/users/:_id/logs is
// an object that should have a description, duration, and date properties.

// The description property of any object in the log array that is
// returned from GET /api/users/:_id/logs should be a string.

// The duration property of any object in the log array that is
// returned from GET /api/users/:_id/logs should be a number.

// The date property of any object in the log array that is
// returned from GET /api/users/:_id/logs should be a string.
// Use the dateString format of the Date API.

// You can add from, to and limit parameters to a GET /api/users/:_id/logs
// request to retrieve part of the log of any user.
// from and to are dates in yyyy-mm-dd format.
// limit is an integer of how many logs to send back.

app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const  from  = req.query.from == null ? "1970-01-01" : req.query.from;
  const  to  = req.query.to == null ? "2050-01-01" : req.query.to;
  const { limit } = req.query;
  findlogs(_id, [from, to, limit], (err, data) => {
    if(err){
      console.log(err);
      res.json({
        _id: _id,
        username: 'not founded',
        count: 0,
        log: []
      });
    }else{
      res.json({
        _id: data._id,
        username: data.username,
        count: data.exercises.length,
        log: data.exercises
      });
    }
  })  
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

const mongoose = require('mongoose');
const { Schema } = mongoose;

let userSchema = new mongoose.Schema({
     "username": {type: String, required: true},
     "exercises": [{ type: Schema.Types.ObjectId, ref: 'exercise' }]
   });
let exercisesSchema = new mongoose.Schema({
    "user": { type: Schema.Types.ObjectId, ref: 'user', required: true },
    "description": {type: String },
    "duration": { type: Number },
    "date": { type: String},
    "dateISO": { type: Date}
})

let User = mongoose.model('user', userSchema);
let Exercise = mongoose.model('exercise', exercisesSchema);

function createAndSaveUser(name, done) {
  var newUSer = new User({
    username: name,
    exercises: []
  });
    newUSer.save((error, data) => {
      if(error){
        console.log(error);
      }else {
        done(null, data);
        return data;
      }
    })
}

function findUsername(username, done) {
  User.findOne({username: username})
      .exec((error, data) => {
        if(error) {
          console.log(error)
        }else {
          done(null, data)
          return data
        }
      })
}

function findAllUsername(done) {
  User.find()
      .select('_id username')
      .exec((error, data) => {
        if(error) {
          console.log(error)
        }else {
          done(null, data)
          return data
        }
      })
}

function createAndSaveExercise(arr, done) {
  var newExercise = new Exercise({
    "user": arr[0],
    "description": arr[1],
    "duration": arr[2],
    "date": new Date(arr[3]).toDateString(),
    "dateISO": new Date(arr[3])
  });

  newExercise.save((error, data) => {
    if(error){
      console.log(error);
    }else {
      User.findByIdAndUpdate(
        arr[0],
        {
          $push: {exercises: data['_id']}
        },
        { 'new': true },
        (err, d) => {
          if(err) console.error(err);
          else return done(null, [d, data]);
        }
      );
      return data;
    }
  })
}

function findlogs(id, params, done){
  User.findById(id)
      .select('_id username exercises')
      .exec((err, dataOne) => {
        if(err) {
          console.error(err)
          done({}, null);
          return;
        }else if(dataOne === null){
          done({}, null);
          return; 
        } else {
          Exercise.find({
            _id: {
              $in: dataOne.exercises
            },
            dateISO: {
              $gte: params[0],
              $lte: params[1],
            }
          })
                  .select('-_id -user -__v -dateISO')
                  .limit(params[2])
                  .exec((err, dataTwo) => {
                    if(err){
                      console.error(err)
                    } else {
                      dataOne['exercises'] = dataTwo;
                      done(null, dataOne);
                      return dataTwo;
                    }
                  })
        }
        return dataOne;
      })
}

exports.createAndSaveUser = createAndSaveUser;
exports.createAndSaveExercise = createAndSaveExercise;
exports.findUsername = findUsername;
exports.findAllUsername = findAllUsername;
exports.findlogs = findlogs;
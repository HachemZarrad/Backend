var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var userDetailRouter = express.Router();
var authenticate = require('../authenticate');
const cors = require('./cors');
userDetailRouter.use(bodyParser.json());




userDetailRouter.get('/:userId', authenticate.verifyUser, authenticate.verifyAdmin, cors.cors, (req,res,next) => {
    User.findById(req.params.userId)
    .then((user) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(user);
    }, (err) => next(err))
    .catch((err) => next(err));
  })
  
  userDetailRouter.route('/filter/:username')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
      filter = req.params.username;
      filterList = [];
      User.find()
      .then((users) => {
          for(user of users){
              if(user.username.toLowerCase().includes(filter.toLowerCase())){
                  filterList.push(user);
              }
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(filterList);
      }, (err) => next(err))
      .catch((err) => next(err));
  });

  module.exports = userDetailRouter;
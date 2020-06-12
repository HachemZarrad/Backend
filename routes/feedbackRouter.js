const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const feedbackRouter = express.Router();
const Feedbacks = require('../models/feedback');
var authenticate = require('../authenticate');
const cors = require('./cors');
feedbackRouter.use(bodyParser.json());


feedbackRouter.route('/filter/:firstname')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) =>{
    filter = req.params.firstname;
    filterList = [];
    Feedbacks.find()
    .then((feedbacks) => {
        for(feedback of feedbacks){
            if(feedback.firstname.toLowerCase().includes(filter.toLowerCase())){
                filterList.push(feedback);
            }
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(filterList);
    }, (err) => next(err))
    .catch((err) => next(err));
});

feedbackRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Feedbacks.find(req.query)
    .then((feedbacks) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedbacks);
    }, (err) => next(err))
    .catch((err) => next(err));
})

.post(cors.corsWithOptions, (req, res, next) => {
    Feedbacks.create(req.body)
    .then((feedback) => {
        console.log('feedback added successfully ', feedback);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedbacks.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));    
});

feedbackRouter.route('/:feedbackId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors,  authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    Feedbacks.findById(req.params.feedbackId)
    .then((feedback) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(feedback);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Feedbacks.findByIdAndRemove(req.params.feedbackId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = feedbackRouter;
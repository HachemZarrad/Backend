const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const promoRouter = express.Router();
const Promotions = require('../models/promotions');
var authenticate = require('../authenticate');
const cors = require('./cors');
promoRouter.use(bodyParser.json());


promoRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.find(req.query)
    .then((promotions) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotions);
    }, (err) => next(err))
    .catch((err) => next(err));   
})

.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.create(req.body)
    .then((promotion) =>{
        console.log('Promotion created', promotion);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.remove({})
    .then((answer) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(answer);
    }, (err) => next(err))
    .catch((err) => next(err));
});


promoRouter.route('/:promoId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.findById(req.params.promoId)
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndUpdate(req.params.promoId, {$set: req.body}, {new: true})
    .then((promotion) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(promotion);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findByIdAndDelete(req.params.promoId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

promoRouter.route('/:promoId/comments')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.findById(req.params.promoId)
    .populate('comments.author')
    .then((promo) => {
        if (promo != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo.comments);
        }
        else {
            err = new Error('promotion ' + req.params.promoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((promo) => {
        if (promo != null) {
            req.body.author = req.user._id;
            promo.comments.push(req.body);
            promo.save()
            .then((promo) => {
                Promotions.findById(promo._id)
                .populate('comments.author')
                .then((promo) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promo);
                })            
            }, (err) => next(err));
        }
        else {
            err = new Error('promotion ' + req.params.promoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /promotions/'
        + req.params.promoId + '/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((promo) => {
        if (promo != null) {
            for (var i = (promo.comments.length -1); i >= 0; i--) {
                promo.comments.id(promo.comments[i]._id).remove();
            }
            promo.save()
            .then((promo) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(promo);                
            }, (err) => next(err));
        }
        else {
            err = new Error('promotion ' + req.params.promoId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));    
});

promoRouter.route('/:promoId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Promotions.findById(req.params.promoId)
    .populate('comments.author')    
    .then((promo) => {
        if (promo != null && promo.comments.id(req.params.commentId) != null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo.comments.id(req.params.commentId));
        }
        else if (promo == null) {
            err = new Error('promo ' + req.params.promoId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /promotions/'+ req.params.promoId
        + '/comments/' + req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((promo) => {
        commentToUpdate = promo.comments.id(req.params.commentId);
        if (promo != null && commentToUpdate != null) {
            if(req.user._id.equals(commentToUpdate.author._id)){
            if (req.body.rating) {
                commentToUpdate.rating = req.body.rating;
            }
            if (req.body.comment) {
                commentToUpdate.comment = req.body.comment;                
            }
            promo.save()
            .then((promo) => {
                 Promotions.findById(promo._id)
                .populate('comments.author')
                .then((promo) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promo);  
                })              
            }, (err) => next(err));
         }
         else{
            err = new Error("You can't modify other people comments");
            err.status = 404;
            return next(err);
         }
        }
        else if (promo == null) {
            err = new Error('promotion ' + req.params.promoId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Promotions.findById(req.params.promoId)
    .then((promo) => {
        commentToDelete = promo.comments.id(req.params.commentId);
        if (promo != null && commentToDelete != null) {
            if(req.user._id.equals(commentToDelete.author._id)){

            commentToDelete.remove();
            promo.save()
            .then((promo) => {
                Promotions.findById(promo._id)
                .populate('comments.author')
                .then((promo) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(promo);  
                })               
            }, (err) => next(err));
         }
         else{
            err = new Error("You can't delete other people comments");
            err.status = 404;
            return next(err);
         }
        }
        else if (promo == null) {
            err = new Error('promotion ' + req.params.promoId + ' not found');
            err.status = 404;
            return next(err);
        }
        else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = promoRouter;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const favoriteRouter = express.Router();
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
favoriteRouter.use(bodyParser.json());
const cors = require('./cors');
const Dishes = require('../models/dishes');

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .populate('user')
    .populate('dishes')
    .then((favorite) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var ids = [];
    for(i in req.body){
        id = req.body[i]._id;
        Dishes.findById(id)
        .then((dish) => {
            if(dish != null){
                ids.push(dish._id);
            }
            else{
                err = new Error('Dish ' + req.body[i]._id + ' not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    }

      Favorites.findOne({user: req.user._id})
      .then((favorite) => {
        if(favorite != null){
             for(element of ids){
                if(favorite.dishes.indexOf(element) == -1){
                    favorite.dishes.push(element);
                }
                else{
                    err = new Error('Dish ' + element + ' already exists in your list of favorites');
                    err.status = 404;
                    return next(err);
                }
             }
             favorite.save()
             .then((favorite) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);  

                },(err) => next(err));
                }
            
        else{
            req.body = {};
            req.body.user = req.user._id;
            Favorites.create(req.body)
            .then((favorite) => {
                for(element of ids){
                    if(favorite.dishes.indexOf(element) == -1){
                        favorite.dishes.push(element);
                        }
                    else{
                        console.log(favorite.dishes);
                        err = new Error('Dish ' + element + ' already exists in your list of favorites');
                        err.status = 404;
                        return next(err);
                        }
                    }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);  

                 },(err) => next(err));
                                  
                },(err) => next(err));

            }
        },(err) => next(err)); 
})  

.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorites.findOneAndRemove({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err)); 
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if (dish != null) {
            Favorites.findOne({user: req.user._id})
            .then((favorite) => {
                if(favorite != null){
                    if(favorite.dishes.indexOf(dish) == -1){
                        favorite.dishes.push(dish);
                        favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);  
                        }, (err) => next(err));
                    }
                    else{
                        err = new Error('Dish ' + req.params.dishId + ' already exists in your list of favorites');
                        err.status = 404;
                        return next(err);
                    }
                }
                else{
                    req.body.user = req.user._id;
                    Favorites.create(req.body)
                    .then((favorite) => {
                        if(favorite.dishes.indexOf(dish) == -1){
                            favorite.dishes.push(dish);
                            favorite.save()
                            .then((favorite) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(favorite);  
                            }, (err) => next(err));
                        }    
                        else{
                            err = new Error('Dish ' + req.params.dishId + ' already exists in your list of favorites');
                            err.status = 404;
                            return next(err);
                        }            
                }, (err) => next(err)); 

                }
            }, (err) => next(err));
             
            }       
            
        else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
                }
        }, (err) => next(err))
        .catch((err) => next(err));      
    
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
   Dishes.findById(req.params.dishId)
   .then((dish) => {
       if(dish == null){
         err = new Error('Dish ' + req.params.dishId + ' not found');
         err.status = 404;
         return next(err);
       }
       else{
         Favorites.findOne({user: req.user._id})
         .then((favorite) => {
             if(favorite != null && favorite.dishes != null){
                for(element of favorite.dishes){
                    if(element._id.equals(req.params.dishId)){
                        favorite.dishes.remove(element);
                    }
                }
                favorite.save()
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite); 
                }, (err) => next(err))
             }
             else if (favorite == null) {
                err = new Error('Your list of favorites is empty');
                err.status = 404;
                return next(err);
            }
            else {
                err = new Error('Dish ' + req.params.dishId + ' not found in your list of favorites');
                err.status = 404;
                return next(err);            
            }
         }, (err) => next(err))
         
       }
   }, (err) => next(err))
   .catch((err) => next(err));
});


module.exports = favoriteRouter;
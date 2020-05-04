const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const Favorites = require("../models/favorites");

var authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user dishes")
      .then(
        favorites => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      if (favorite) {
        req.body.map(favoriteDish => {
          if (favorite.dishes.indexOf(favoriteDish._id) == -1) {
            favorite.dishes.push({ _id: favoriteDish._id });
          }
        });
        favorite.save().then(updatedFavorite => {
          Favorites.findById(updatedFavorite._id)
            .populate("user dishes")
            .then(
              updatedFavorite => {
                res.status = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(updatedFavorite);
              },
              err => next(err)
            )
            .catch(err => next(err));
        });
      } else if (!favorite) {
        let newFavorite = new Object({
          user: req.user._id
        });
        req.body.map(favoriteDish => {
          if (favorite.dishes.indexOf(favoriteDish._id) == -1) {
            newFavorite.dishes.push({ _id: favoriteDish._id });
          }
        });
        favorite.save();
        then(newFavorite => {
          Favorites.findById(newFavorite._id)
            .populate("user dishes")
            .then(
              newFavorite => {
                res.status = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(newFavorite);
              },
              err => next(err)
            )
            .catch(err => next(err));
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      if (favorite) {
        favorite.dishes = [];
        favorite
          .save()
          .then(
            updatedFavorite => {
              res.status = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(updatedFavorite);
            },
            err => next(err)
          )
          .catch(err => next(err));
      } else if (!favorite) {
        let err = new Error(
          "You've no dish in your favorite list, request aborted"
        );
        err.status = 403;
        return next(err);
      }
    });
  });

favoriteRouter
  .route("/:dishId")
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        favorites => {
          if (!favorites) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({ exists: false, favorites: favorites });
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: false, favorites: favorites });
            } else {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              return res.json({ exists: true, favorites: favorites });
            }
          }
        },
        err => next(err)
      )
      .catch(err => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      if (favorite) {
        if (favorite.dishes.indexOf(req.params.dishId) == -1) {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite.save();
          then(updatedFavorite => {
            Favorites.findById(updatedFavorite._id)
              .populate("user dishes")
              .then(
                updatedFavorite => {
                  res.status = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(updatedFavorite);
                },
                err => next(err)
              )
              .catch(err => next(err));
          });
        } else {
          let err = new Error(
            "This dish is already added to your favorite list, operation aborted"
          );
          err.status = 403;
          return next(err);
        }
      } else if (!favorite) {
        let newFavorite = new Object({
          user: req.user._id,
          dishes: [{ _id: req.params.dishId }]
        });
        Favorites.create(newFavorite);
        then(newFavorite => {
          Favorites.findById(newFavorite._id)
            .populate("user dishes")
            .then(
              newFavorite => {
                res.status = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(newFavorite);
              },
              err => next(err)
            )
            .catch(err => next(err));
        });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(favorite => {
      let index = favorite.dishes.indexOf(req.params.dishId);
      if (index != -1) {
        favorite.dishes.splice(index, 1);
        favorite.save().then(updatedFavorite => {
          Favorites.findById(updatedFavorite._id)
            .populate("user dishes")
            .then(
              updatedFavorite => {
                res.status = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(updatedFavorite);
              },
              err => next(err)
            )
            .catch(err => next(err));
        });
      } else {
        let err = new Error(
          "Selected dish is not your favorite dish, request aborted"
        );
        err.status = 403;
        return next(err);
      }
    });
  });

module.exports = favoriteRouter;
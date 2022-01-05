const express = require("express");
const router = express.Router();
const controller = require("../controllers/Movie");

router.get("/fetch/:year/:pag", controller.fetch);
router.get("/search/:search/:page", controller.search);
router.get("/movies/:page", controller.getMovies);
router.get("/movie/:movie", controller.getMovie);
router.get("/moviesbygenre/:genre/:page", controller.getMoviesByGenre);
router.get("/moviesbyactor/:actor/:page", controller.getMoviesByActor);
router.get("/relatedmovies/:movie/", controller.getRelatedMovies);
// router.get('/:id', controller.get);
// router.post('/', controller.post);
// router.put('/:id', controller.put);
// router.delete('/:id', controller.delete);
// router.delete('/soft/:id', controller.softDelete);

module.exports = router;

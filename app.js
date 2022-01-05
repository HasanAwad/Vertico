require("dotenv").config();
var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
mongoose
	.connect(process.env.CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		// useFindAndModify: false,
	})
	.then(() => {
		console.log("successfully connected");
	})
	.catch(console.error);

//Resolve routes

var moviesRouter = require("./routes/movies");

var app = express();
app.use(cors({ origin: true, credential: true }));
app.use(helmet());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/movies", moviesRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	res.status(err.status || 500).send({
		success: false,
		message: err.message,
	});
});

module.exports = app;

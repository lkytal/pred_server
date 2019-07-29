let fs = require('fs');
let async = require('async');
let markdown = require('markdown').markdown;
let express = require("express");
let path = require("path");
let favicon = require('serve-favicon');
let logger = require("morgan");
let compress = require('compression');
let cookieParser = require("cookie-parser");
let bodyParser = require("body-parser");
let ejs = require('ejs').__express;
let helmet = require('helmet');
let request = require('request');

let utils = require('./routes/utils')

app = express();

app.set('port', process.env.PORT || 5000);
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
app.engine('ejs', ejs);
app.engine('.html', ejs);
app.engine('coffee', require('coffeecup').__express);

app.engine('md', function(path, options, callback) {
	return fs.readFile(path, 'utf8', function(err, str) {
		if (err) {
			return callback(err);
		}
		console.log(options);
		return callback(null, markdown.toHTML(str));
	});
});

app.use(helmet());
app.use(favicon(__dirname + '/assets/favicon.ico'));
app.use(logger("dev"));
app.use(compress());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
	extended: false
}));

app.use(cookieParser());

app.use(express["static"](path.join(__dirname, "assets")));

app.get("/", function(req, res) {
	res.render('index', {
		url: "index"
	});
});

app.get('/predict', function(req, res) {
	return res.render('predict', {
		peptide: ""
	});
});

app.get('/predict/:type/:charge/:peptide', function(req, res) {
	return res.render('predict', {
		type: req.body.type,
		charge: req.body.charge,
		peptide: req.body.peptide
	});
});

app.get('/json/:type/:charge/:peptide', function(req, res) {
	// console.log(req.params);
	let matrix = utils.embed(req.params.type, req.params.charge, req.params.peptide);

	if (matrix === false) {
		res.status(404);
		return res.send([-1]);
	}

	// console.log(matrix);

	request({
		url: 'http://localhost:9000/v1/models/lx:predict',
		method: "POST",
		json: true,
		headers: { "content-type": "application/json" },
		body: {"instances": [{'input': matrix}]}
	}, function(error, response, body) {
		if (!error && response.statusCode == 200) {
			let [mzs, its] = utils.filter(body['predictions'][0]);
			// console.log(mzs, its);
			return res.send([utils.fastmass(req.params.peptide), mzs, its]);
		}
		else {
			res.status(404);
			return res.send([200, [...Array(100).keys()], [...Array(100).keys()]]);
		}
	});
});

app.post('/predict', function(req, res) {
	return res.redirect("/predict/" + req.body.type + "/" + req.body.charge + "/" + req.body.peptide);
});

app.get(["/:url.html", "/:url"], function(req, res, next) {
	fs.stat("views/" + req.params.url + ".ejs", function(err, stat) {
		if (err === null) {
			return res.render(req.params.url, {
				url: req.params.url,
				errMsg: ""
			});
		}
		else {
			return next();
		}
	});
});

app.get(["/:url.html", "/:url"], function(req, res, next) {
	fs.stat("views/" + req.params.url + ".ejs", function(err, stat) {
		if (err === null) {
			return res.render(req.params.url, {
				url: req.params.url,
				errMsg: ""
			});
		}
		else {
			return next();
		}
	});
});

app.use(function(req, res, next) {
	res.status(404);
	res.render("404");
});

app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render("error.coffee", {
		message: err.message,
		error: err
	});
});

app.listen(app.get('port'), function() {
	var base;
	return console.log("Node running at localhost:" + (app.get('port')) + ", ENV is " + ((base = process.env).ENV != null ? base.ENV : base.ENV = 'productive'));
});

module.exports = app;

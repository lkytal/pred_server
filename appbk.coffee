fs = require 'fs'
async = require 'async'
markdown = require('markdown').markdown
express = require("express")
path = require("path")
favicon = require('serve-favicon')
logger = require("morgan")
compress = require('compression')
cookieParser = require("cookie-parser")
bodyParser = require("body-parser")
ejs = require('ejs').__express
session = require('express-session')
crypto = require('crypto')
helmet = require('helmet')

app = express()
app.set 'port', (process.env.PORT || 5000)

app.set "views", path.join(__dirname, "views")
app.set 'view engine', 'ejs'
app.engine 'ejs', ejs
app.engine '.html', ejs
app.engine 'coffee', require('coffeecup').__express
app.engine 'md', (path, options, callback) ->
	fs.readFile path, 'utf8', (err, str) ->
		return callback(err) if err
		console.log options
		callback null, markdown.toHTML(str)

app.use helmet()
app.use favicon(__dirname + '/assets/favicon.ico')
app.use logger("dev")
app.use compress()
app.use bodyParser.json()
app.use bodyParser.urlencoded(extended: false)
app.use cookieParser()
app.use express.static path.join(__dirname, "assets")

app.get "/", (req, res) ->
	res.render 'index', url: "index"
	return

app.get '/predict', (req, res) ->
	res.render 'predict', { peptide: "" }

app.get '/predict/:type/:charge/:peptide', (req, res) ->
	res.render 'predict', { type: req.body.type, charge: req.body.charge, peptide: req.body.peptide }

charMap = { "A": 1, "R": 2, "N": 3, "D": 3, "C": 5, "E": 5, "Q": 7 }

app.get '/json/:type/:charge/:peptide', (req, res) ->

	res.send [0, 1, 3]

app.post '/predict', (req, res) ->
	res.redirect("/predict/#{req.body.type}/#{req.body.charge}/#{req.body.peptide}")

app.get ["/:url.html", "/:url"], (req, res, next) ->
	fs.stat "views/#{req.params.url}.ejs", (err, stat) ->
		if err == null
			res.render req.params.url, { url: req.params.url, errMsg: "" }
		else
			next()
	return

app.get ["/:url.html", "/:url"], (req, res, next) ->
	fs.stat "views/#{req.params.url}.ejs", (err, stat) ->
		if err == null
			res.render req.params.url, { url: req.params.url, errMsg: "" }
		else
			next()
	return

# catch 404
app.use (req, res, next) ->
	res.status 404
	res.render "404"
	return

app.use (err, req, res, next) ->
	res.status err.status or 500
	res.render "error.coffee",
		message: err.message
		error: err
	return

app.listen app.get('port'), () ->
	console.log "Node running at localhost:#{app.get('port')}, ENV is #{process.env.ENV?='productive'}"

module.exports = app

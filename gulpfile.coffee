Chalk = require 'chalk'
gulp = require 'gulp'
plumber = require 'gulp-plumber'
coffee = require 'gulp-coffee'
watch = require 'gulp-watch'
babel = require "gulp-babel"
uglify = require 'gulp-uglify'
nodemon = require 'gulp-nodemon'
less = require 'gulp-less'
cleanCSS = require 'gulp-clean-css'
autoprefixer = require 'gulp-autoprefixer'
postcss = require 'gulp-postcss'
color_rgba_fallback = require 'postcss-color-rgba-fallback'
opacity = require 'postcss-opacity'
pseudoelements = require 'postcss-pseudoelements'
vmin = require 'postcss-vmin'
pixrem = require 'pixrem'
will_change = require 'postcss-will-change'
#concat = require 'gulp-concat'
#imagemin = require 'gulp-imagemin'
#plugins = require('gulp-load-plugins')()

processors = [
    will_change,
    color_rgba_fallback,
    opacity,
    pseudoelements,
    vmin,
    pixrem
]

coffeeToJs = (src, dest) ->
	console.log "complie #{src}"
	dest ?= './'
	gulp
	.src src
	.pipe plumber()
	.on 'error', console.log
	.pipe coffee { bare: true }
	.pipe babel()
	.pipe uglify()
	.pipe gulp.dest(dest)

watchCoffee = (src, dest) ->
	dest ?= './'
	gulp
	.src src
	.pipe watch(src)
	.pipe plumber()
	.on 'error', console.log
	.pipe coffee { bare: true }
	.pipe babel()
	.pipe uglify()
	.pipe gulp.dest(dest)

gulp.task 'coffee', ->
	coffeeToJs './Code/*.coffee', './assets/js'
	#coffeeToJs './routes/*.coffee'

lessToJs = (src, dest) ->
	console.log "complie #{src}"
	dest ?= './'
	gulp
	.src src
	.pipe plumber()
	.on 'error', console.log
	.pipe less()
	.pipe(autoprefixer())
	.pipe postcss(processors)
	.pipe cleanCSS()
	.pipe gulp.dest(dest)

watchLess = (src, dest) ->
	dest ?= './'
	gulp
	.src src
	.pipe watch(src)
	.pipe plumber()
	.on 'error', console.log
	.pipe less()
	.pipe cleanCSS()
	.pipe(autoprefixer())
	.pipe postcss(processors)
	.pipe gulp.dest(dest)

gulp.task 'less', ->
	lessToJs './less/**/*.*', './assets/css'

watchJS = (src, dest) ->
	dest ?= './assets/js'
	gulp
	.src src
	.pipe watch(src)
	.pipe plumber()
	.on 'error', console.log
	.pipe babel()
	.pipe uglify()
	.pipe gulp.dest(dest)

gulp.task 'watch', ->
	#watchCoffee './routes/*.coffee'
	watchCoffee './Code/*.coffee', './assets/js'
	watchLess './less/**/*.*', './assets/css'
	watchJS './Code/*.js', './assets/js'

gulp.task 'selfWatch', ->
	restart = () ->
		console.log(Chalk.green.bold('gulpfile changed and restarted'))
		coffeeToJs './gulpfile.coffee'

		setTimeout ->
			require('child_process').spawn 'cmd.exe', ['-c gulp'], {stdio: 'inherit'}
			process.exit(0)
		, 600

	watch('./gulpfile.coffee', restart).on 'error', (e) -> console.log(Chalk.red.blod(e.message))

gulp.task 'default', ->
	gulp.start 'web'
	gulp.start 'watch'
	gulp.start 'selfWatch'

gulp.task 'build', ->
	gulp.start 'watch'
	gulp.start 'selfWatch'

gulp.task 'web', ['nodemon'], ->
	browserSync = require('browser-sync').create()

	browserSync.init null, {
		proxy : "http://localhost:5000"
		files : ["views/*.*", "assets/**/*.*"]
		browser : "ff"
		port : 7000
	}

gulp.task 'nodemon', ['coffee', 'less'], (cb) ->
	process.env.ENV = 'localWeb'
	return nodemon({
		script: 'main.js',
		watch: ['app.coffee', 'app.js', "routes/"],
		ignore: ["code/"]
	})
	.once 'start', cb

gulp.task 'test', ->
	process.env.ENV = 'development'
	return nodemon({
		script: 'main.js',
		watch: ['app.coffee', 'app.js', "routes/"],
		ignore: ["code/"]
	})

// config
var conf = require('./gulp.config.js').conf;

// Load plugins
var gulp = require('gulp'),
	fs = require('fs'),
	jade = require('gulp-jade'),
	sass = require('gulp-sass'),
	sassGlob = require('gulp-sass-glob'),
	sourcemaps = require('gulp-sourcemaps'),
	autoprefixer = require('gulp-autoprefixer'),
	cleancss = require('gulp-clean-css'),
	jshint = require('gulp-jshint'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	spritesmith = require('gulp.spritesmith'),
	svg2png = require('gulp-svg2png'),
	svgSprite = require('gulp-svg-sprite'),
	svgmin = require('gulp-svgmin'),
	rename = require('gulp-rename'),
	clean = require('gulp-clean'),
	concat = require('gulp-concat'),
	notify = require('gulp-notify'),
	cache = require('gulp-cache'),
	plumber = require('gulp-plumber'),
	argv = require('yargs').argv,
	watch = require('gulp-watch'),
	prettify = require('gulp-prettify'),
	browserSync = require('browser-sync').create();

// Templates
gulp.task('templates', function () {
	gulp.src(['../src/templates/*.jade'])
	.pipe(plumber())
	.pipe(jade({
		pretty: '\t'
	}))
	.pipe(prettify({indent_size: 2}))
	.pipe(gulp.dest('../src/'))
	.on('end', browserSync.reload);
});

// Styles
gulp.task('styles', function () {
	return gulp.src(['../src/styles/base/main.scss'])
	.pipe(sassGlob())
	.pipe(plumber())
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', sass.logError))
	.pipe(rename('style.css'))
	.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
	.pipe(sourcemaps.write('./maps'))
	.pipe(gulp.dest('../src/styles'))
	.pipe(browserSync.stream())
	.pipe(notify({ message: 'Styles task complete' }));
});

gulp.task('styles:prod', function () {
	return gulp.src(['../src/styles/style.css', '../src/styles/style-ie8.css'])
	.pipe(cleancss())
	.pipe(gulp.dest('../dist/styles'))
	.pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', ['clean-scripts', 'lint'], function () {
	return gulp.src(['../src/scripts/vendor/jquery.js', '../src/scripts/vendor/*.js', '../src/components/**/*.js' ])
	.pipe(sourcemaps.init())
	.pipe(concat('main.js'))
	.pipe(sourcemaps.write('./maps'))
	.pipe(gulp.dest('../src/scripts'))
	.pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('scripts:prod', function () {
	return gulp.src('../src/scripts/main.js')
	.pipe(uglify())
	.pipe(gulp.dest('../dist/scripts'))
	.pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('lint', function () {
	return gulp.src('../src/components/**/*.js')
	.pipe(jshint({
		curly: true,
		eqeqeq: false,
		eqnull: true,
		undef: false,
		unused: false,
		loopfunc: true,
		browser: true,
		jquery: true,
		globals: ['$']
	}))
	.pipe(jshint.reporter('default'))
});

// Images
gulp.task('images', function () {
	gulp.src(['../src/images/*', '!../src/images/icons'])
	.pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
	.pipe(gulp.dest('../dist/images')); 

	gulp.src(['../src/uploads/*'])
	.pipe(gulp.dest('../dist/uploads'));
});

gulp.task('move', function () {
	gulp.src(['../src/uploads/*'])
	.pipe(gulp.dest('../dist/uploads'))

	gulp.src(['../src/fonts/*'])
	.pipe(gulp.dest('../dist/fonts'))

	gulp.src(['../src/*.html', './src/*.ico'])
	.pipe(gulp.dest('../dist'))    
});  

// Sprite
gulp.task('sprite', function () {
	var spriteData = gulp.src('../src/images/icons/*.png').pipe(spritesmith({
		cssName: 'sprite.scss',
		cssVarMap: function (item) {
			// If this is a hover sprite, name it as a hover one (e.g. 'home-hover' -> 'home:hover')
			if (item.name.indexOf('-hover') !== -1) {
				item.name = 'icon_' + item.name.replace('-hover', ':hover');
			// Otherwise, use the name as the selector (e.g. 'home' -> 'home')
			} else {
				item.name = 'icon_' + item.name;
			}
		},
		imgName: 'sprite.png',
		imgPath: '../images/sprite.png'
	}));

	spriteData.img.pipe(gulp.dest('../src/images'));
	spriteData.css.pipe(gulp.dest('../src/styles/base'));
});


// Clean
gulp.task('clean-dist', function () {
	return gulp.src(['../dist/*'], {read: false})
	.pipe(clean({force: true}));
});

gulp.task('clean-scripts', function () {
	return gulp.src('../src/scripts/main.js', {read: false})
	.pipe(clean({force: true}));
});

// Default task
gulp.task('default', function () {
	gulp.start('templates', 'styles', 'scripts');
});

// Production
gulp.task('production', ['clean-dist'], function() {
	gulp.start('styles:prod', 'scripts:prod', 'images', 'move');
});

// Create block
gulp.task('create', function () {
	var name = argv.block,
		styleBody = '.' + name +' {\n\n}',
		templateBody = 'mixin ' + name + '()\n' + '\t.' + name + '&attributes(attributes)',
		exist = fs.existsSync('../src/components/'+ name);
		if (!exist) {
			if (name) {
				fs.mkdir('../src/components/'+ name, function() {
					fs.writeFile('../src/components/'+ name + '/' + name +'.scss' ,  styleBody, function(err) {
					  if (err) throw err;
					  fs.writeFile('../src/components/'+ name + '/' + name +'.jade' ,  templateBody, function(err) {
					  	if (err) throw err;
					  	console.log('Block is created');
					  });
					});
				})
			} else {
				console.log('Block name is required');
			}
		}	else {
			console.log('Block is already exists');
		}
});

// Page list
gulp.task('page-list', function () {
	var files = fs.readdirSync('../src/').filter(function(item) {
		return fs.statSync('../src/' + item).isFile() && /.html/.test(item) && item !== 'index.html';
	});
	var list = '';

	files.forEach(function (fileItem) {
		list += '<li><a href="'+ fileItem +'">' + fileItem + '</a></li>';
	});
	var template = '<ul>' + list + '</ul>';

	fs.writeFile('../src/index.html', template, function(err) {
		if(err) throw err;
		console.log("The file was created!");
	});
});

// Watch
gulp.task('watch', function() {

	browserSync.init({
		server: {
			baseDir: "../src"
		},
		open: false,
		notify: false,
		ghostMode: false,
	});

	// Watch .scss files
	watch(['../src/styles/**/*.scss', '../src/components/**/*.scss'], function() {
		gulp.start('styles');
	});

	// Watch .js files
	watch(['../src/scripts/**/*.js', '../src/components/**/*.js', '!../src/scripts/main.js'], function() {
		gulp.start('scripts');
	});
	
	// Watch jade files
	watch(['../src/templates/**/*.jade', '../src/components/**/*.jade'], function() {
		gulp.start('templates');
	});   
});
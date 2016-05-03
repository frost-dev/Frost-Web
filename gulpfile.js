var gulp = require("gulp");
var stylus = require("gulp-stylus");
var autoprefixer = require("gulp-autoprefixer");

gulp.task("stylus", function() {
	gulp.src("src-assets/**/*.styl")
		.pipe(stylus())
		.pipe(autoprefixer())
		.pipe(gulp.dest("./assets"));
});

gulp.task("css", function() {
	gulp.src("src-assets/**/*.css")
		.pipe(autoprefixer())
		.pipe(gulp.dest("./assets"));
});

gulp.task("copy", function() {
	gulp.src(["src-assets/**/*.js", "src-assets/**/*.png"])
		.pipe(gulp.dest("./assets"));
});

gulp.task("default", ["stylus", "css", "copy"]);

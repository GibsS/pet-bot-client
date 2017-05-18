'use strict'

// IMPORTS
// GULP UTILITY
var gulp = require('gulp'),
  gulpif = require('gulp-if'),
  rename = require('gulp-rename'),
  jsonEditor = require('gulp-json-editor'),
  replace = require('gulp-replace'),
  gulpSequence = require('gulp-sequence'),
  gutil = require('gulp-util')

// TEST
var mocha = require('gulp-mocha');

// NODE UTILITY
var source = require('vinyl-source-stream'),
  clean = require('gulp-clean'),
  fs = require('fs'),
  path = require('path'),
  merge = require('merge-stream')

// COMPILATION
var typescript = require('typescript'),
  ts = require('gulp-typescript'),
  browserify = require('browserify'),
  uglify = require('uglify-js-harmony'),
  minifier = require('gulp-uglify/minifier')

// ARGS
var yargsParser = require('yargs-parser')

// SOURCE CONFIG FILE
var tsProject = ts.createProject('src/tsconfig.json', { typescript: typescript })

let argv
if(process.argv.length >= 3) {
  if(process.argv[2][0] == '-') {
    argv = yargsParser(process.argv.slice(2))
  } else {
    argv = yargsParser(process.argv.slice(3))
  }
} else {
  argv = yargsParser(process.argv.slice(3))
}

// PARSE ARGS
let options = {
  version: null
}

if(argv.v) {
  options.version = argv.v
} else if(argv.ver) {
  options.version = argv.ver
}

// TASKS
// - MISC
// -- change app wide version
gulp.task('bump-version', function() {
  if(options.version) {
    var verPackJson = gulp.src('package.json')
    .pipe(jsonEditor(function(json) {
      json.version = options.version
      return json
    }))
    .pipe(gulp.dest('.', { overwrite: true }))

    return merge(verPackJson)
  }
})

// - BUILDING
gulp.task('compile', function() {
  var result = gulp.src('src/**/*{ts,tsx}')
    .pipe(tsProject())

  return result.js
    .pipe(gulp.dest('js'))
})

gulp.task('build', ['compile'], function() {
  var b = browserify('js/index.js')

  return b.bundle()
    .pipe(source('pet-bot-client.js'))
    .pipe(gulp.dest('dist/'))
})

gulp.task('min', ['build'], function() {
  return gulp.src('dist/pet-bot-client.js')
    .pipe(minifier({}, uglify))
    .pipe(rename('pet-bot-client.min.js'))
    .pipe(gulp.dest('dist/', { overwrite: true }))
})

gulp.task('deploy', ['min'], function() {
  return merge(
    gulp.src("src/index.html")
    .pipe(gulp.dest("dist/static/")),
    gulp.src("dist/pet-bot-client.min.js")
    .pipe(gulp.dest("dist/static"))
  )
})

// -- remove generated files (js and dist)
gulp.task('clean', function () {
  return gulp.src(['js', 'dist'], { read: false })
    .pipe(clean())
})

gulp.task('default', gulpSequence('clean', 'deploy')) 
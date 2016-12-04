var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');
var moment = require('moment');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var collections = require('metalsmith-collections');
var excerpts = require('metalsmith-excerpts');
var browserify = require('metalsmith-browserify-alt');

var preprocess = require('metalsmith-preprocess');

var siteBuild = Metalsmith(__dirname)
    .metadata({
      site: {
        title: "Things SAPPLE Makes",
        url: 'https://spencerapple.com',
        description: '',
        repo: "https://gitlab.com/splayemu/splayemu.gitlab.io"
      }
    })
    .source('./src')
    .destination('./build')
    .ignore([
      '**/.*.swp'
    ])
    .use(markdown())
    .use(excerpts())
    .use(collections({
      content: {
        pattern: 'content/**/*.html',
        sortBy: 'publishDate',
        reverse: true
      },
      partials: {
        pattern: 'partials/**/*.html'
      }
    }))
    .use(permalinks({
      relative: false
    }))
    .use(preprocess())
    .use(browserify())
    .use(function (files, metadata, done) {
      console.log(metadata);
      done();
    })
    .use(layouts({
      engine: 'pug',
      moment: moment,
      partials: "partials"
    }))
    .use(serve({
      port: 8080,
      verbose: true
    }))
    .use(watch({
      pattern: '**/*',
      livereload: true
    }))
    .build(function (err, files) {
      if (err) {
        throw err;
      }
      else {
        console.log('Served files:');
        for (key in files) {
          console.log(key);
        }
      }
    });

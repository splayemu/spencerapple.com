var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');
var moment = require('moment');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var collections = require('metalsmith-collections');
var excerpts = require('metalsmith-excerpts');

//src/content/test-post/preprocess.js

var preprocess = require('metalsmith-preprocess');

var siteBuild = Metalsmith(__dirname)
    .metadata({
      site: {
        title: "SAPPLE's PROJECTS",
        url: 'https://spencerapple.com',
        description: 'Fun times for all'
      }
    })
    .source('./src')
    .destination('./build')
    .use(markdown())
    .use(excerpts())
    .use(collections({
      content: {
        pattern: 'content/**/*.html',
        sortBy: 'publishDate',
        reverse: true
      }
    }))
    .use(permalinks({
      relative: false
    }))
    .use(preprocess())
    .use(layouts({
      engine: 'jade',
      directory: 'templates',
      moment: moment
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

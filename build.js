var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var permalinks = require('metalsmith-permalinks');
var moment = require('moment');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var branch = require('metalsmith-branch');
var collections = require('metalsmith-collections');
var excerpts = require('metalsmith-excerpts');

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
      posts: {
        pattern: 'content/**.html',
        sortBy: 'publishDate',
        reverse: true
      }
    }))
    .use(branch('content/**.html')
        .use(permalinks({
          pattern: 'content/:title',
          relative: false
        }))
    )
    .use(branch('!posts/**.html')
        .use(branch('!index.md').use(permalinks({
          relative: false
        })))
    )
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
        console.log('Site build complete!');
      }
    });

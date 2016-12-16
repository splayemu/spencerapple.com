var Metalsmith = require('metalsmith');
var markdown = require('metalsmith-markdown');
var layouts = require('metalsmith-layouts');
var moment = require('moment');
var serve = require('metalsmith-serve');
var watch = require('metalsmith-watch');
var collections = require('metalsmith-collections');
var excerpts = require('metalsmith-excerpts');
var browserify = require('metalsmith-browserify-alt');
var path = require('metalsmith-paths');
var msif = require('metalsmith-if');

var preprocess = require('metalsmith-preprocess');

// look for build flag
var preview = false;
var args = process.argv.slice(2);
if (args.length) {
  preview = true;
}

var siteBuild = Metalsmith(__dirname)
    .metadata({
      site: {
        title: "Spencer Apple",
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
    .use(path({ directoryIndex: "index.html" }))
    .use(preprocess())
    .use(browserify())
    .use(layouts({
      engine: 'pug',
      moment: moment,
      partials: "partials"
    }))
    // livereload and preview server only run if command line argument present
    .use(msif(
      preview,
      serve({
        port: 8080,
        verbose: true,
        http_error_files: {
          404: "/404.html"
        },
      })
    ))
    .use(msif(
      preview,
      watch({
        paths: {
          '${source}/**/*': true,
          'layouts/**/*': '**/*',
        }
      })
    ))
    .build(function (err, files) {
      if (err) {
        throw err;
      }
      else {
        //console.log(files);
        console.log('Served files:');
      }
    });

const listen = require('merry/listen')
const notFound = require('merry/404')
const reduce = require('hyperreduce')
const normcore = require('normcore')
const error = require('merry/error')
const json = require('merry/json')
const bankai = require('bankai')
const envobj = require('envobj')
const merry = require('merry')
const level = require('level')
const path = require('path')

const env = envobj({ KEY: String })
const feed = normcore(env.KEY)
const getLogHead = getProdLoghead(feed)

const entry = path.join(__dirname, 'client.js')

const assets = bankai(entry)
const app = merry()

app.router([
  ['/404', notFound()],
  ['/', function (req, res, params, done) {
    done(null, assets.html(req, res))
  }],
  ['/bundle.js', (req, res, params, done) => {
    done(null, assets.js(req, res))
  }],
  ['/bundle.css', (req, res, params, done) => {
    done(null, assets.css(req, res))
  }],
  ['/loglines.json', function (req, res, params, done) {
    getLogHead(function (err, last) {
      if (err) return done(error(500, 'getLogHead failed', err))
      done(null, json(req, res, { message: last }))
    })
  }]
])

listen(8080, app.start())

function getProdLoghead (feed) {
  const db = level('/tmp/dat-land-dashboard.db', { valueEncoding: 'json' })
  return reduce(feed, db, reducer)

  function reducer (last, data, next) {
    last = last || 0
    next(null, last + 1)
  }
}

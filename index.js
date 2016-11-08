const mutate = require('xtend/mutable')
const listen = require('merry/listen')
const notFound = require('merry/404')
const reduce = require('hyperreduce')
const normcore = require('normcore')
const json = require('merry/json')
const bankai = require('bankai')
const envobj = require('envobj')
const merry = require('merry')
const level = require('level')
const ta = require('time-ago')()
const path = require('path')

const env = envobj({
  KEY: String,
  PORT: 8080
})
const feed = normcore(env.KEY)
const db = level('/tmp/dat-land-dashboard.db', { valueEncoding: 'json' })
const state = startReducing(feed, db, [ lineCount, latestDate ])

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
  ['/stats', [
    ['/linecount.json', function (req, res, params, done) {
      done(null, json(req, res, { message: state.lineCount }))
    }],
    ['/latest-date.json', function (req, res, params, done) {
      done(null, json(req, res, { message: ta.ago(new Date(state.latestDate)) }))
    }]
  ]]
])

listen(env.PORT, app.start())

function startReducing (feed, db, reducers) {
  const state = {}
  const getHead = reduce(feed, db, function reducer (last, data, next) {
    try {
      var json = JSON.parse(data)
    } catch (e) {
      return next(null, last)
    }
    reducers.forEach((reducer) => reducer(last || {}, json, state))
    next(null, state)
  })
  getHead(function (err, head) {
    if (err) throw err
    mutate(state, head)
  })
  return state
}

function lineCount (last, data, state) {
  const lineCount = last.lineCount || 0
  state.lineCount = (lineCount + 1)
}

function latestDate (last, data, state) {
  state.latestDate = data.time
}

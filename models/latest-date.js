const Model = require('choo-model')
const xhr = require('xhr')

module.exports = linecount

function linecount () {
  const model = Model('latestDate')
  model.state({ value: null })
  model.reducer('update', function (state, data) {
    return { value: data }
  })

  model.subscription('poll', function (send, done) {
    setInterval(fetch, 10 * 1000)
    fetch()
    function fetch () {
      send('latestDate:fetch', done)
    }
  })

  model.effect('fetch', function (state, data, send, done) {
    xhr('/stats/latest-date.json', function (err, res, body) {
      if (err) return done(err)
      if (res.statusCode !== 200) {
        return done(new Error("couldn't fetch latest date"))
      }
      try {
        body = JSON.parse(body)
      } catch (e) {
        done(e)
      }
      send('latestDate:update', body.message, done)
    })
  })
  return model.start()
}

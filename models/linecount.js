const Model = require('choo-model')
const xhr = require('xhr')

module.exports = linecount

function linecount () {
  const model = Model('linecount')
  model.state({ value: 0 })

  model.reducer('update', function (state, data) {
    return { value: data }
  })

  model.subscription('poll', function (send, done) {
    setInterval(fetch, 10 * 1000)
    fetch()
    function fetch () {
      send('linecount:fetch', done)
    }
  })

  model.effect('fetch', function (state, data, send, done) {
    xhr('/stats/linecount.json', function (err, res, body) {
      if (err) return done(err)
      if (res.statusCode !== 200) {
        return done(new Error("couldn't fetch loglines"))
      }
      try {
        body = JSON.parse(body)
      } catch (e) {
        done(e)
      }
      send('linecount:update', body.message, done)
    })
  })

  return model.start()
}

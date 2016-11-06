const Model = require('choo-model')
const mount = require('choo/mount')
const html = require('choo/html')
const log = require('choo-log')
const css = require('sheetify')
const choo = require('choo')
const xhr = require('xhr')

css('tachyons')

const app = choo()
app.use(log())

app.model(AppModel())
app.router(['/', mainView])
mount('body', app.start())

function mainView (state, prev, send) {
  return html`
    <body class="pa3 pa4-ns">
      <header>
        <h1 class="f-6">DAT LAND STATS</h1>
      </header>
      <main>
        <section>
          <h3 class="f2 mb0">total lines logged</h3>
          <p class="f2 mt0">${state.logs.lineCount} lines</p>
        </section>
      </main>
    </body>
  `
}

function AppModel () {
  const model = Model('logs')
  model.state({ lineCount: 0 })

  model.reducer('updateLineCount', function (state, data) {
    return { lineCount: data }
  })

  model.subscription('poll', function (send, done) {
    setInterval(fetch, 10 * 1000)
    fetch()
    function fetch () {
      send('logs:fetch', done)
    }
  })

  model.effect('fetch', function (state, data, send, done) {
    xhr('/loglines.json', function (err, res, body) {
      if (err) return done(err)
      if (res.statusCode !== 200) {
        return done(new Error("couldn't fetch loglines"))
      }
      try {
        body = JSON.parse(body)
        send('logs:updateLineCount', body.message, done)
      } catch (e) {
        done(e)
      }
    })
  })

  return model.start()
}

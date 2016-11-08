const mount = require('choo/mount')
const html = require('choo/html')
const log = require('choo-log')
const css = require('sheetify')
const choo = require('choo')

css('tachyons')

const app = choo()
app.use(log())

app.model(require('./models/linecount')())
app.model(require('./models/latest-date')())

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
          <p class="f2 mt0">${state.linecount.value} lines</p>
        </section>
        <section>
          <h3 class="f2 mb0">latest log 😅</h3>
          <p class="f2 mt0">${state.latestDate.value}</p>
        </section>
      </main>
    </body>
  `
}

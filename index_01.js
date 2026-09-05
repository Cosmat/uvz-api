const http = require("http")
const app = require("./app")
const cors = require("cors")

const host = "0.0.0.0"
const port = 8000

var options = {
  // key: sslkey,
  // cert: sslcert,
  // dhparam: dhparam,
}
async function start() {
  app.use(cors({
    origin: true, // или конкретно ваш домен
    credentials: true
  }))
  const server = http.createServer(options, app)
  server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
  })
}

start()

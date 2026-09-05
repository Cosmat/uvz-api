const https = require("https")
const fs = require("fs")
const app = require("./app")

const host = "0.0.0.0"
const port = 8000
const sslcert = fs.readFileSync(
  "/etc/letsencrypt/live/rabota-nt.ru/fullchain.pem",
  "utf8"
)
const sslkey = fs.readFileSync(
  "/etc/letsencrypt/live/rabota-nt.ru/privkey.pem",
  "utf8"
)
// var dhparam = fs.readFileSync(
//   "/home/pi/Desktop/v_07/server/dhparam.pem",
//   "utf8"
// );
var options = {
  key: sslkey,
  cert: sslcert,
  // dhparam: dhparam,
}
async function start() {
  const server = https.createServer(options, app)
  server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
  })
}

start()

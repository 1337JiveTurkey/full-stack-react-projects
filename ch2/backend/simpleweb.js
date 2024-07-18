import { createServer } from "node:http"

const server = createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "text/plain")
  res.end("Hello HTTP world!")
})

const host = "localhost"
const port = 8080

server.listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`)
})

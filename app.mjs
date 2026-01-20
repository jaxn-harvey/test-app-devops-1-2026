// app.js

import express from 'express'
// es5 syntax: import express from 'express'
// es6 syntax: import { name } from 'module-name'
//import { express } from 'express'

const app = express()

app.get('/', (req, res) => {
  res.send('Testing, testing.')
})

// start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000 hurray')
})

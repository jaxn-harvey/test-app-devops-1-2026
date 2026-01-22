//

import express from 'express'
// es5 syntax: import express from 'express'
// es6 syntax: import { name } from 'module-name'
//import { express } from 'express'

//imports go up top
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const app = express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middlewares aka endpoints aka 'get to slash' {http verb} to slash {your endpoint}
app.get('/', (req, res) => {
  res.send('Testing, testing.')
  res.sendFile('index.html') // this doesn't work w/o imports, assign, arguments
  res.sendFile(join(__dirname, 'public'));
})

// start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000 hurray')
})

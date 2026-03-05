
// // app.js

// import express from 'express'
// // es5 syntax: import express from 'express'
// // es6 syntax: import { name } from 'module-name'
// //import { express } from 'express'

// const app = express()

// app.get('/', (req, res) => {
//   res.send('Hello, Express v2')
// })

// // start the server
// app.listen(3000, () => {
//   console.log('Server is running on http://localhost:3000 hurray')
// })

//app.mjs
//we are in ES6, use this. 
import 'dotenv/config'; 
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'fs/promises';  // For async file reading
import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb';

//const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uri = process.env.MONGO_URI;  
//const myVar = 'injected from server'; // Declare your variable


app.use(express.static(join(__dirname, 'public')));
app.use(express.json()); 




// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectToMongo() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}
connectToMongo();


// middlewares aka endpoints aka 'get to slash' {http verb} to slash {you name ur endpoint}
app.get('/', (req, res) => {
  // res.send('Hello Express'); //string response
  // res.sendFile('index.html'); // <- this don't work w/o imports, assign, and arguements
  res.sendFile(join(__dirname, 'public', 'index.html')) ;

})

app.get('/inject', (req, res) => {
  // Inject a server variable into barry.html: templating view like ejs or pug
  readFile(join(__dirname, 'public', 'index.html'), 'utf8')
    .then(html => {
      // Replace a placeholder in the HTML (e.g., {{myVar}})
      const injectedHtml = html.replace('{{myVar}}', myVar);
      res.send(injectedHtml);
    })
    .catch(err => {
      res.status(500).send('Error loading page');
    });
})

//API Health/Endpoints Documentation
app.get('/pages/pycert.html', (req, res) => {
  const endpoints = [
    {
      method: 'GET',
      path: '/',
      description: 'Serve the main HTML page'
    },
    {
      method: 'GET',
      path: '/inject',
      description: 'Serve HTML with server-side variable injection'
    },
    {
      method: 'GET',
      path: '/api/health',
      description: 'Show all available API endpoints'
    },
    {
      method: 'GET',
      path: '/api/class',
      description: 'Get class information (course details)'
    },
    {
      method: 'POST',
      path: '/api/attendance',
      description: 'CREATE - Add new student attendance record',
      bodyExample: {
        studentName: 'John Doe',
        date: 'February 3, 2026',
        keyword: 'devops'
      }
    },
    {
      method: 'GET',
      path: '/api/attendance',
      description: 'READ - Get all attendance records'
    },
    {
      method: 'PUT',
      path: '/api/attendance/:id',
      description: 'UPDATE - Update existing attendance record',
      bodyExample: {
        studentName: 'Jane Doe',
        date: 'February 3, 2026',
        keyword: 'mongodb'
      }
    },
    {
      method: 'DELETE',
      path: '/api/attendance/:id',
      description: 'DELETE - Remove attendance record'
    }
  ];

  res.json({
    status: 'healthy',
    server: 'CIS 486 DevOps Server',
    timestamp: new Date().toISOString(),
    endpoints: endpoints
  });
});

//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})


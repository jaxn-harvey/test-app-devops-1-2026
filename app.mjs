//app.mjs
//we are in ES6, use this. 
import express from 'express';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// import * as fs from 'node:fs';
import { readFile } from 'fs/promises';
import { MongoClient , ServerApiVersion } from 'mongodb';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const files = fs.readFile('.');
// let myVar = 'demo purposes only';

app.use(express.static(join(__dirname, 'public')));
app.use(express.json()); 

////////////////
//const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

////////////

// middlewares aka endpoints aka 'get to slash' {http verb} to slash {you name ur endpoint}
app.get('/', (req, res) => {
  //res.send('Hello Express'); //string response
  //res.sendFile('index.html'); // <- this don't work w/o imports, assign, and arguements
  res.sendFile(join(__dirname, 'public', 'index.html')) ;

})

app.get('/api/json', (req, res) =>{
  const myVar = 'Hello from server!';
  res.json({ myVar });
})

app.get('/api/query', (req, res) => {

  console.log("client request with query param:", req.query.name); 
  res.json({"name": req.query.name});
});

app.post('/api/body', (req, res) => {
  console.log("the body:", req.body); 
  console.log("client request with body:", req.body.name); 
  res.json({"name": req.body.name});
});

//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})

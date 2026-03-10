
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
  res.sendFile(join(__dirname, 'public', 'index.html'));

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

// API Health/Endpoints Documentation
app.get('/api/health', (req, res) => {
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
      path: '/api/visitor',
      description: 'Get visitor information (name and date?)'
    },
    {
      method: 'POST',
      path: '/api/messages',
      description: 'CREATE - Add new message record',
      bodyExample: {
        visitorName: 'John Doe',
        date: 'March 10, 2026',
        message: 'devops'
      }
    },
    {
      method: 'GET',
      path: '/api/messages',
      description: 'READ - Get all message records'
    },
    {
      method: 'PUT',
      path: '/api/messages/:id',
      description: 'UPDATE - Update existing message record',
      bodyExample: {
        visitorName: 'Jane Doe',
        date: 'March 10, 2026',
        message: 'mongodb'
      }
    },
    {
      method: 'DELETE',
      path: '/api/messages/:id',
      description: 'DELETE - Remove message record'
    }
  ];

  res.json({
    status: 'healthy',
    server: 'CIS 486 Jackson Quebec mini-app',
    timestamp: new Date().toISOString(),
    endpoints: endpoints
  });
});

// App Information API
app.get('/api/about', (req, res) => {
  const messageInfo = {
    courseNumber: 'CIS 486',
    courseName: 'Projects in IS',
    midtermApp: 'Midterm Quebec mini-app',
    semester: 'Spring 2026'
  };
  res.json(appInfo);
});

// CRUD Operations for Messages

// CREATE - Add mesages
app.post('/api/messages', async (req, res) => {
  try {
    const { visitorName, date, message } = req.body;

    if (!visitorName || !date || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // leaving these as is
    const db = client.db('quebec');
    const collection = db.collection('messages');

    const messageRecord = {
      visitorName,
      date,
      message,
      timestamp: new Date()
    };

    const result = await collection.insertOne(messageRecord);
    res.json({ message: 'Message recorded!', id: result.insertedId });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to record message' });
  }
});

// READ - Get all message records
app.get('/api/messages', async (req, res) => {
  try {
    const db = client.db('quebec');
    const collection = db.collection('messages');

    const records = await collection.find({}).toArray();
    res.json(records);
  } catch (error) {
    console.error('Error reading messages:', error);
    res.status(500).json({ error: 'Failed to get message records' });
  }
});

// UPDATE - Update message record
app.put('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { visitorName, date, message } = req.body;

    const db = client.db('quebec');
    const collection = db.collection('messages');

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { visitorName, date, message, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Messages updated!' });
  } catch (error) {
    console.error('Error updating messages:', error);
    res.status(500).json({ error: 'Failed to update messages' });
  }
});

// DELETE - Delete message record
app.delete('/api/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const db = client.db('quebec');
    const collection = db.collection('messages');

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }

    res.json({ message: 'Message deleted!' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

//start the server. 
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})


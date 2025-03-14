import express from 'express';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.set('view engine', 'ejs'); // Set up EJS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI);
let db, clientsCollection;

async function connectToDatabase() {
  try {
    await client.connect(); // Connect to MongoDB
    db = client.db('clientportalDB'); // Connect to the correct database
    clientsCollection = db.collection('clients'); // Access the 'clients' collection
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
}

// Call the function to connect to MongoDB
connectToDatabase();
app.get('/', (req, res) => {
    res.redirect('/login');
  });
// Serve the login page
app.get('/login', (req, res) => {
  res.render('login'); // Render the login page
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const { name, password } = req.body;

 try {
    const client = await clientsCollection.findOne({ name });

    if (client && client.password === password) {
      // After successful login, redirect to the client portal (index)
      res.redirect(`/index?name=${client.name}`);
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Serve the main portal page
app.get('/index', async (req, res) => {
    const { name } = req.query; // Get the logged-in client's name (passed as a query param or session)
  
    try {
      if (!clientsCollection) {
        throw new Error('Database connection not initialized.');
      }
  
      // Fetch the client data from the database
      const client = await clientsCollection.findOne({ name });
  
      if (client) {
        // Pass the client data to the index.ejs page
        res.render('index', { client });
      } else {
        res.redirect('/login'); // If the client does not exist, redirect to login
      }
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

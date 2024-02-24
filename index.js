import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const mongoURI = 'mongodb+srv://aryanshu221623:%23CarsDealer1@cluster0.izuvruy.mongodb.net/';
const dbName = 'User_app';
const jwtSecret = '23344466666';

let db;
MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db(dbName);
  })
  .catch(err => console.error('Error connecting to MongoDB', err));

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send({ auth: false, message: 'No token provided.' });
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    
    req.userId = decoded.id;
    next();
  });
};



//generate JWT token
const generateToken = (userData) => {
  return jwt.sign({ id: userData._id, role: userData.role }, jwtSecret, { expiresIn: '1h' });
};



//Auth endpoints

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.collection('users').findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = generateToken(user);
    res.status(200).json({ auth: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//logout endpoint


app.get('/logout', (req, res) => {
  res.status(200).send({ auth: false, token: null });
});


// end points


app.get('/cars', verifyToken, async (req, res) => {
  try {
    const cars = await db.collection('cars').find().toArray();
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/cars/:dealershipId', verifyToken, async (req, res) => {
  const { dealershipId } = req.params;
  try {
    const cars = await db.collection('cars').find({ dealershipId }).toArray();
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post('/add-vehicle', verifyToken, async (req, res) => {
  const { userId, vehicle } = req.body;
  try {
    const result = await db.collection('vehicles').insertOne({ ...vehicle, ownerId: userId });
    res.status(201).json(result.ops[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.get('/deals/:dealershipId', verifyToken, async (req, res) => {
  const { dealershipId } = req.params;
  try {
    const deals = await db.collection('deals').find({ dealershipId }).toArray();
    res.status(200).json(deals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dealership endpoints


// Add car 
app.post('/dealerships/cars', verifyToken, async (req, res) => {
  const { dealershipId, car } = req.body;
  try {
    const result = await db.collection('cars').insertOne({ ...car, dealershipId });
    res.status(201).json(result.ops[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// add deals
app.post('/dealerships/deals', verifyToken, async (req, res) => {
  const { dealershipId, deal } = req.body;
  try {
    const result = await db.collection('deals').insertOne({ ...deal, dealershipId });
    res.status(201).json(result.ops[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View / owner info endpoint


app.get('/dealerships/:dealershipId/sold-vehicles', verifyToken, async (req, res) => {
  const { dealershipId } = req.params;
  try {
    const cars = await db.collection('cars').find({ dealershipId, ownerId: { $exists: true } }).toArray();
    res.status(200).json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API documentation endpoint
app.get('/api-docs', (req, res) => {
    const documentation = `
    <h1>Car Dealership API Documentation</h1>
    <p>Welcome to the Car Dealership API documentation. Below are the available endpoints:</p>
    <ul>
      <li><strong>POST /login:</strong> Endpoint to login with email and password.</li>
      <li><strong>GET /logout:</strong> Endpoint to logout and invalidate the token.</li>
      <li><strong>GET /cars:</strong> Retrieve all cars.</li>
      <li><strong>GET /cars/:dealershipId:</strong> Retrieve cars in a specific dealership.</li>
      <li><strong>POST /add-vehicle:</strong> Add a new vehicle.</li>
      <li><strong>GET /deals/:dealershipId:</strong> Retrieve deals from a specific dealership.</li>
      <li><strong>POST /dealerships/cars:</strong> Add a car to a dealership.</li>
      <li><strong>POST /dealerships/deals:</strong> Add a deal to a dealership.</li>
      <li><strong>GET /dealerships/:dealershipId/sold-vehicles:</strong> Retrieve sold vehicles from a specific dealership.</li>
      <li><strong>GET /api-docs:</strong> Display this API documentation.</li>
    </ul>
    `;
    res.status(200).send(documentation);
  });
  


const port = 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

const cors = require("cors");
require("dotenv").config();

// middleware
app.use(cors());
app.use(express.json());


// uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgg2e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri)

//Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('FoodFeast');
    const foodCollection = database.collection('Foods');
    const reviewCollection = database.collection('Reviews');
    const userCollection = database.collection('Users');

    // add new Food
    app.post('/foods', async (req, res) => {
      const food = req.body;
      const result = await foodCollection.insertOne(food);
      res.json(result);
    })

    // find All Food
    app.get('/foods', async (req, res) => {
      const cursor = foodCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    })

    // find Food by ID
    app.get('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await foodCollection.findOne(query);
      res.json(result);
    })

    // delete Food by ID
    app.delete('/foods/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await foodCollection.deleteOne(query);
      res.json(result);
    })

    // find food by type
    app.get('/foods/query', async (req, res) => {
      const type = req.query.type
      const query = { type: type };
      const cursor = foodCollection.find(query);
      const result = await cursor.toArray();
      res.json(result)
    })

    // add a review
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result)
    })

    // get all reviews
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({});
      const result = await cursor.toArray();
      res.json(result)
    })

    // add a new user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.json(result);
    })

    // get all user 
    app.get('/users', async (req, res) => {
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.json(result)
    })

    // update new user
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    // add an admin
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result)
    })

    // check if the user is admin
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role == "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin })
    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello Foodies!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
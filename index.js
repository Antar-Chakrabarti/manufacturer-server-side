const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello from bike manufaxering')
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q3lvh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
try{
    await client.connect();
    const productsCollection = client.db('bike_parts').collection('products');
    const placeOrderCollection = client.db('bike_parts').collection('place_orders');
    const userCollection = client.db('bike_parts').collection('users');
    const reviewCollection = client.db('bike_parts').collection('review');



    app.put('/user/:email', async(req, res)=>{
        const email = req.params.email;
        const user = req.body;
        const filter = {email: email};
        const options = {upsert: true};
        const updateDoc = {
            $set: user,
        }
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10d'})
        res.send({result, token})
    })
    app.get('/products', async(req, res)=>{
        const query = {};
        const products = await productsCollection.find(query).toArray();
        res.send(products)
    });
    app.get('/products/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const product = await productsCollection.findOne(query)
        res.send(product)
    })
    app.post('/place-order', async (req, res) => {
        const user = req.body;
        const result = await placeOrderCollection.insertOne(user);
        res.send(result)
    })
    app.get('/place-order', async(req, res)=>{
        const email = req.query.email;
        console.log(email)
        const query = {email: email};
        const  order = await placeOrderCollection.find(query).toArray();
        res.send(order)
    });
    app.post('/review', async(req, res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result)
    })
}
finally{
    /* await client.close(); */
}
}
run().catch(console.dir)




app.listen(port, () => {
    console.log(`listening on port ${port}`)
})
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

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
       if (err) {
            return res.status(403).send({ message: 'forbidden' })
        }
        req.decoded = decoded;
        next();
    });
}

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
    app.put('/user/admin/:email',/* verifyJWT, */ async(req, res)=>{
        const email = req.params.email;
        const filter = {email: email};
        const updateDoc = {
            $set: {role: 'admin'},
        }
        const result = await userCollection.updateOne(filter, updateDoc);
        res.send(result)
    })
    app.get('/admin/:email', async(req, res)=>{
        const email = req.params.email;
        const user = await userCollection.findOne({email: email})
        const isAdmin = user.role === 'admin';
        res.send({admin: isAdmin})
    })
    app.get('/user',/* verifyJWT, */ async(req, res)=>{
        const result = await userCollection.find().toArray();
        res.send(result)
    })
    app.get('/products', async(req, res)=>{
        const query = {};
        const products = await productsCollection.find(query).toArray();
        res.send(products)
    });
    app.get('/products/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const product = await productsCollection.find(query)
        res.send(product)
    })
    app.post('/place-order', async (req, res) => {
        const user = req.body;
        const result = await placeOrderCollection.insertOne(user);
        res.send(result)
    })
    app.get('/place-order', verifyJWT, async(req, res)=>{
        const email = req.query.email;
        const query = {email: email};
        const  order = await placeOrderCollection.find(query).toArray();
        res.send(order)
    });
    app.post('/review', async(req, res)=>{
        const review = req.body;
        const result = await reviewCollection.insertOne(review);
        res.send(result)
    })
    app.get('/review', async(req, res)=>{
        const result = await reviewCollection.find().toArray();
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
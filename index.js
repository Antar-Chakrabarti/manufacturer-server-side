const express = require('express');
const cors = require('cors');
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
    app.post('/place-order', async(req, res)=>{
        const parts = req.body;
        const query = {name: parts.name, email: parts.user}
        const exists = await placeOrderCollection.findOne(query);
        if(exists){
            return res.send({success: false, parts: exists})
        }
        const result = placeOrderCollection.insertOne(parts);
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
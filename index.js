const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

    app.get('/products', async(req, res)=>{
        const query = {};
        const products = await productsCollection.find(query).toArray();
        res.send(products)
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
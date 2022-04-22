const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());


// data basr main conection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hdbuk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const serviceCollection = client.db("genius-car").collection("service");

async function run() {

    try {
        await client.connect();
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })
        // posr
        app.post('/service',async(req,res)=>{
            const service = req.body;
            const regult = await serviceCollection.insertOne(service);
            res.send(regult);
        })
        // Delete one file
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.deleteOne(query);
            res.send(service);
        })
    }

    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('this is Running')
})
app.listen(port, () => {
    console.log('port is running now', port);
})
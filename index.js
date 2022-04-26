const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

// JWT vrify 
function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: "unauthorized access" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Forbiden" })
        }
        // console.log(decoded);
        req.decoded = decoded;
        next();
    })
}


// data base main conection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hdbuk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const serviceCollection = client.db("genius-car").collection("service");
const orderCollection = client.db("genius-car").collection("order");

async function run() {

    try {
        await client.connect();

        // auth token WJT
        // secret-kay coomand: require('crypto').randomBytes(64).toString('hex')
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.SECRET_KEY, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // services api
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

        // post
        app.post('/service', async (req, res) => {
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

        // order collection api
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        app.get('/order', verifyJwt, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders)
            }
            else{
                return res.status(403).send({ message: "Forbiden access" })
            }
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
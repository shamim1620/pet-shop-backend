const express = require('express')
const { MongoClient } = require('mongodb');
require('dotenv').config()
const app = express()
const cors = require('cors');
const port = process.env.PORT | 5000

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iwf59.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("petShop");
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');

        // GET API 
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })

        //POST API
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product)

            res.json(result);
        });

        //save user
        app.post('/users', async (req, res) => {
            const user = req.body;
            // console.log('user',req.body)
            const result = await usersCollection.insertOne(user);
            // console.log(result);
            res.json(result);

        });
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // create admin 
        app.put('/users/admin', async (req, res) => {
            const email = req.body.email;

            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' }
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })


    }

    finally {
        // await client.close();
    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('pet shop server is running')
})

app.listen(port, () => {
    console.log(`listening ${port}`)
})

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

try {
    await client.connect();

    console.log('MongoDB Connected');

} catch (error) {
    console.log(error);
}

const db = client.db('wedplan');
const servicesCollection = db.collection('services');
const usersCollection = db.collection('users');

app.get('/', (req, res) => {
    res.send('hello world');
});

app.get('/services/:id', async (req, res) => {
    try {
        const id = req.params.id;

        const service = await servicesCollection.findOne({
            _id: new ObjectId(id),
            status: 'approved',
            isActive: true
        });

        if (!service) {
            return res.status(404).send({
                message: 'Service not found'
            });
        }

        const vendor = await usersCollection.findOne(
            { _id: service.vendorId },
            {
                projection: {
                    name: 1,
                    image: 1,
                    businessName: 1
                }
            }
        );

        res.send({
            data: {
                ...service,
                vendor: vendor
            }
        });

    } catch (error) {
        res.status(500).send({
            message: 'Something went wrong'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

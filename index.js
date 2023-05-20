const express=require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vzgfrzr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection= client.db('toyboxDB').collection('products');


// post
   app.post('/addedProduct',async(req, res)=>{
    const product=req.body;
    // console.log(product)
    const result =await productCollection.insertOne(product)
    // console.log(result)
    res.send(result)

   })

//    get
    
    app.get('/allProducts',async(req, res)=>{
        const result = await productCollection.find().toArray();
        res.send(result)
    })

    app.get('/productDetails/:id',async(req, res)=>{
        const id=req.params.id;
        console.log(id)
        const filter= {_id: new ObjectId(id)}
        const result = await productCollection.findOne(filter)
        // const result=await productCollection.find
        res.send(result)
    })


    app.get('/myToys',async(req, res)=>{
       
       console.log(req.query.email)
        console.log(req.query.useNumber)
        const result = await productCollection.find({ email: req.query.email}).sort({price:req.query.useNumber}).collation({locale:"en_US",numericOrdering:true}).toArray()
        res.send(result)
   
    })

    // delete
    app.delete('/myToys/:id', async(req, res)=>{
      const id= req.params.id;
      const query={_id: new ObjectId(id)}
      const result = await productCollection.deleteOne(query)
      res.send(result)
    })

    // update(put)

    app.get('/myToyUpdate/:id',async(req,res)=>{
      const id= req.params.id;
      const query={_id: new ObjectId(id)}
      const result =await productCollection.findOne(query)
      res.send(result)

    })

    app.put('/myToyUpdate/:id',async(req, res)=>{
      const id=req.params.id;
      const filter={_id: new ObjectId(id)}
      const options={upsert:true};
      const updatedToy=req.body
      console.log(updatedToy)
      const myToyUpdate={
        $set:{
          price:updatedToy.price,
          available_quantity:updatedToy.available_quantity,
          description:updatedToy.description

        }
      }
      const result=await productCollection.updateOne(filter,myToyUpdate ,options)
      res.send(result)
    })


    // create index
    const indexKeys={toyName:1};
    const indexOptions={name:'toyName'}

    const result = await productCollection.createIndex(indexKeys,indexOptions)

    app.get('/toySearchBytoyName/:text',async(req,res)=>{
      const searchToy=req.params.text;
      const result =await productCollection.find({
        $or:[
          {toyName:{$regex :searchToy, $options:"i"}}
        ]
      }).toArray();
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('Server is running...')
})

app.listen(port,()=>{
    console.log(`Server is running on port:${port}`)
})
import express from 'express';
const cors = require("cors");

const app = express();
const router = express.Router();
const port = 3020;

app.use(cors());
app.use(express.json()); // Add this line to parse JSON request bodies
app.use('/tenant-creation', router);
app.use('/', router);

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

router.post('/tenants', (req, res) => {  
  console.log("Tenant create request: ", req.body);
  res.send('Tenant created successfully!');
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
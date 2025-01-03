import express from 'express';

const app = express();
const port = 3021;

app.get('/', (req, res) => {
  res.send('Hello, TypeScript with Express!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
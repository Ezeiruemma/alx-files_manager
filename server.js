import express from 'express';
import indexRoute from './routes/index';

const app = express();
const PORT = 5000;

app.use(indexRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

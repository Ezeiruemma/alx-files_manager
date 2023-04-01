import { Router } from 'express';
import AppController from '../controllers/AppController';

const indexRoute = Router();

indexRoute
  .get('/status', AppController.getStatus)
  .get('/stats', AppController.getStats);

export default indexRoute;

import { Router } from 'express';
import AppController from '../controllers/AppController.js';

const indexRoute = Router();

indexRoute
    .get('/status', AppController.getStatus)
    .get('/stats', AppController.getStats)

export default indexRoute;

import { Router } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import { handleAuthorization, handleXToken } from '../middlewares/auth.middleware';
import FilesController from '../controllers/FilesController';

const indexRoute = Router();

indexRoute
  .get('/status', AppController.getStatus)
  .get('/stats', AppController.getStats)
  .post('/users', UsersController.postNew)
  .get('/connect', handleAuthorization, AuthController.getConnect)
  .get('/disconnect', AuthController.getDisconnect)
  .get('/users/me', handleXToken, UsersController.getMe)
  .post('/files', handleXToken, FilesController.postUpload);

export default indexRoute;

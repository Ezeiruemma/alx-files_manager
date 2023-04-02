import sha1 from 'sha1';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export const handleAuthorization = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const authToken = authorization.split(' ')[1];
  const decrypted = Buffer.from(authToken, 'base64').toString();
  const email = decrypted.split(':')[0];
  const password = decrypted.split(':')[1];
  const user = await dbClient.useCollection('users').findOne({ email });

  if (!user || sha1(password) !== user.password) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = user;
  next();
};

export const handleXToken = async (req, res, next) => {
  const xToken = req.headers['x-token'];

  if (!xToken) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const id = await redisClient.get(xToken);

  if (!id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await (dbClient.useCollection('users').findOne({ _id: new mongoDBCore.BSON.ObjectId(id) }));

  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  req.user = user;
  next();
};

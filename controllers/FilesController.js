import mongoDBCore from 'mongodb/lib/core';
import dbClient from '../utils/db';
import saveFile from '../utils/saveFile';

class FilesController {
  static async postUpload(req, res) {
    const {
      name,
      type,
      parentId = 0,
      isPublic = false,
      data,
    } = req.body;
    const { _id: userId } = req.user;
    const AcceptedTypes = ['folder', 'file', 'image'];

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || AcceptedTypes.indexOf(type) === -1) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }
    if (!data && type !== 'folder') {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if (parentId && parentId !== 0) {
      const file = await dbClient.useCollection('files').findOne(
        { _id: new mongoDBCore.BSON.ObjectId(parentId) },
      );

      if (!file) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (file && file.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }
    if (type === 'folder') {
      const file = {
        userId,
        name,
        type,
        isPublic,
        parentId,
      };
      const { ops } = await dbClient.useCollection('files').insertOne(file);
      const { _id, ...newOps } = ops[0];
      res.status(201).json({ id: _id, ...newOps });
      return;
    }
    if (type === 'file' || type === 'image') {
      saveFile(data)
        .then(async (data) => {
          const file = {
            userId,
            name,
            type,
            parentId,
            isPublic,
            localPath: `${process.env.FOLDER_PATH || '/tmp/files_manager'}/${data}`,
          };
          const { ops } = await dbClient.useCollection('files').insertOne(file);
          const { _id, ...newOps } = ops[0];
          res.status(201).json({ id: _id, ...newOps });
        })
        .catch((err) => console.log(err));
    }
  }

  static async getShow(req, res) {
    const { _id: userId } = req.user;
    const { id } = req.params;
    const objectId = new mongoDBCore.BSON.ObjectId(id);
    const objectUserId = new mongoDBCore.BSON.ObjectId(userId);
    const file = await dbClient.useCollection('files').findOne({ _id: objectId, userId: objectUserId });

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const { _id, ...newFile } = file;
    res.status(201).json({ id: _id, ...newFile });
  }

  static async getIndex(req, res) {
    const { _id: userId } = req.user;
    const { parentId = 0 } = req.query;
    const page = Number.parseInt(req.query.page, 10) || 0;
    const objectUserId = new mongoDBCore.BSON.ObjectId(userId);
    const file = await dbClient.useCollection('files')
      .aggregate([
        { $match: { parentId, userId: objectUserId } },
        { $sort: { _id: -1 } },
        { $skip: page * 20 },
        { $limit: 20 },
        {
          $project: {
            _id: 0,
            id: '$_id',
            userId: '$userId',
            name: '$name',
            type: '$type',
            isPublic: '$isPublic',
            parentId: {
              $cond: { if: { $eq: ['$parentId', '0'] }, then: 0, else: '$parentId' },
            },
          },
        },
      ]).toArray();
    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    res.status(200).json(file);
  }

  static async putPublish(req, res) {
    const { _id: userId } = req.user;
    const { id } = req.params;
    const objectId = new mongoDBCore.BSON.ObjectId(id);
    const objectUserId = new mongoDBCore.BSON.ObjectId(userId);
    const file = await dbClient.useCollection('files').findOne({ _id: objectId, userId: objectUserId });

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await dbClient.useCollection('files').updateOne(
      { _id: objectId, userId: objectUserId },
      { $set: { isPublic: true } }, 
    )

    const { _id, isPublic, ...newFile } = await file;
    res.status(200).json({ id: _id, isPublic: true, ...newFile });
  }

  static async putUnpublish(req, res) {
    const { _id: userId } = req.user;
    const { id } = req.params;
    const objectId = new mongoDBCore.BSON.ObjectId(id);
    const objectUserId = new mongoDBCore.BSON.ObjectId(userId);
    const file = await dbClient.useCollection('files').findOne({ _id: objectId, userId: objectUserId });

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    await dbClient.useCollection('files').updateOne(
      { _id: objectId, userId: objectUserId },
      { $set: { isPublic: false } },
    );

    const { _id, isPublic, ...newFile } = await file;
    res.status(200).json({ id: _id, isPublic: false, ...newFile });
  }
}

export default FilesController;

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
      const file = await dbClient.useCollection('files').findOne(parentId);

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
}

export default FilesController;

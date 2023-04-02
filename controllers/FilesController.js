import dbClient from '../utils/db';
import saveFile from '../utils/saveFile';

class FilesController {
      static async postUpload(req, res) {
      	  const { name, type, parentId = 0, isPublic = false, data } = req.body;
	 // const { _id } = req.user;
	  const AcceptedTypes = ['folder', 'file', 'image'];
	  
	  if (!name) {
	      res.status(400).json({ error: 'Missing name' });
	      return;
	  }
	  if (!type || AcceptedTypes.indexOf(type) === -1) {
	      res.status(400).json({ error: 'Missing type' });
              return;
          }
	  if (!data && type !== folder) {
	      res.status(400).json({ error: 'Missing data' });
              return;
          }

	  if (parentId && parentId !== 0) {
	      const file  = await dbClient.useCollection('files').findOne(parentId);

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
	      const file = { userId: '_id', name, type, isPublic, parentId }
	      const data = await dbClient.useCollection('files').insertOne(file);

	      res.status(200).json(data);
	      return;
	  }

	  if (type === 'file'){
	      const fileId = saveFile(data)
		    .then(async (data) => {
			const file = {userId: '_id', name, type, parentId, isPublic, localPath: `${process.env.FOLDER_PATH || '/tmp/files_manager'}/${data}`}
			const insertion  = await  dbClient.useCollection('files').insertOne(file);

			res.status(201).send(insertion.ops)
		    })
		    .catch((err) => console.log(err));
	  }
      }
}

export default FilesController;

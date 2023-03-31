import mongodb from 'mongodb';

class DBClient{
    constructor(){
	this.client = new mongodb.MongoClient(`mongodb://${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT ||  27017}/${process.env.DB_DATABASE || 'files_manager'}`);
	this.client.connect();
    }
}

const dbClient = new DBClient();
export default dbClient;

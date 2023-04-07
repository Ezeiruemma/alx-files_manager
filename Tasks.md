# 0x04. Files manager

## Tasks
### 0. Redis utils

Inside the folder utils, create a file redis.js that contains the class RedisClient.

RedisClient should have:

- [x] the constructor that creates a client to Redis:
  - [x] any error of the redis client must be displayed in the console (you should use on('error') of the redis client)
- [x] a function isAlive that returns true when the connection to Redis is a success otherwise, false
- [x] an asynchronous function get that takes a string key as argument and returns the Redis value stored for this key
- [x] an asynchronous function set that takes a string key, a value and a duration in second as arguments to store it in Redis (with an expiration set by the duration argument)
- [x] an asynchronous function del that takes a string key as argument and remove the value in Redis for this key

After the class definition, create and export an instance of RedisClient called redisClient.
```
bob@dylan:~$ cat main.js
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();

bob@dylan:~$ npm run dev main.js
true
null
12
null
bob@dylan:~$ 
```
    
### 1. MongoDB utils

Inside the folder utils, create a file db.js that contains the class DBClient.

DBClient should have:

- [x] the constructor that creates a client to MongoDB:
    - [x] host: from the environment variable DB_HOST or default: localhost
    - [x] port: from the environment variable DB_PORT or default: 27017
    - [x] database: from the environment variable DB_DATABASE or default: files_manager
- [x] a function isAlive that returns true when the connection to MongoDB is a success otherwise, false
- [x] an asynchronous function nbUsers that returns the number of documents in the collection users
- [x] an asynchronous function nbFiles that returns the number of documents in the collection files

After the class definition, create and export an instance of DBClient called dbClient.
```sh
bob@dylan:~$ cat main.js
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();

bob@dylan:~$ npm run dev main.js
false
true
4
30
bob@dylan:~$ 
```
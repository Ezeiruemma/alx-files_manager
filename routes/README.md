# Alx-Files_Manager Methods and API Documentation

## Methods

### `isAlive` 
Check `Redis` or `MongoDB` connection
- Redis
```sh
user@ubuntu:~$ cat main.js
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
})();
```
```sh
user@ubuntu:~$ npm run dev main.js
true
```

- MongoDb
```sh
user@ubuntu:~$ cat main.js
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
})();
```
```sh
user@ubuntu:~$ npm run dev main.js
false
true
```

### `nbUsers` and `nbFiles`
Check number of files and users in the database
```sh
user@ubuntu:~$ cat main.js
import dbClient from './utils/db';

(async () => {
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();
```
```sh
user@ubuntu:~$ npm run dev main.js
4
30
user@ubuntu:~$ 
```

___

## Endpoints

### `/status`
- Method: `GET`
- Purpose: *Check if redis and mongo are up and running*
- Usage:
```sh
user@ubuntu:~$ curl 0.0.0.0:5000/status ; echo ""
{"redis":true,"db":true}
user@ubuntu:~$ 
```

### `/stats`
- Method: `GET`
- Purpose: *Retrieves the number of files and users in the database*
- Usage:
```sh
user@ubuntu:~$ curl 0.0.0.0:5000/stats ; echo ""
{"users":4,"files":30}
user@ubuntu:~$ 
```
# Directors API
* * *

  


### Description
Directors is a simple API that allows a user to create or modify a record for any movie director with an account on Livestream, as well as list all the existing directors' records.  

  

* * *
### Software requirements

[Node](http://nodejs.org/)

[mongoDB](http://www.mongodb.org/)  

  

* * *
### Installation and Setup

#### Run the mongod process
In one terminal window, run the following:  
```
mongod --dbpath <path to data directory>
```  
(or, omit the *--dbpath* option if you're using the default path, **/data/db**)  
  
You should see the message  
```
waiting for connections on port 27017  
```  

  
  

#### Create the DB
In a second terminal window, run:  
```
mongo
```  
At the prompt, type the following:  
```
use MNovDirectorsDB  
```


#### Install node packages
In a third terminal window, in the directory where package.json is located, type:  
```
npm install
```  


#### Run server.js
Now that your local DB is running and all the dependencies are installed, run server.js in order to start up the Node app (and make sure director.js is in the same directory):  
```
node server.js
```  
  
If you see the following, then you've set up everything correctly:  
```
Listening on port 8080  
```

  

* * *
### Making a request

All URLs start with `http://localhost:8080/api`.

Here are the endpoints:
* * *
##### GET /  
The only purpose of this is to test that everything works.  
  
* * *
##### POST /directors  
params: `{livestream_id: 6488834}`   
  
Create a new director record, passing a Livestream account ID as a parameter.  
The livestream ID must be unique. An error message will be returned if you attempt to add a director whose Livestream account ID was already added.   An error message will also be returned if the Livestream account ID is invalid.  
  
* * *
##### GET /directors  
List all directors.  

  
* * *
##### GET /directors/:livestream_id  
Find the director with the specified unique Livestream ID.  
  
* * *
##### PUT /directors/:livestream_id  
headers: `{Authorization: Bearer 10f607392e9e569848a4f03a8cc206ff}`
  
params: `{favorite_camera: 'Sony NEX-VG30H', favorite_movies: 'Goodfellas', 'After Hours', 'Shutter Island'}`
  
Update a director's favorite camera and/or favorite movies.  
In order to update the director's account, the user must authenticate themself with the MD5 hash of the director's full_name.  



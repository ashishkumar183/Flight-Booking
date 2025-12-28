# NodeJS-Template

This is a base node js project template, which anyone can use as it has been prepared, by keeping some of the most important code principles and project management recommendations, Feel free to change anything.

`src` --> Inside the src folder all the actual source code regarding the project will reside, this will not include any kind of tests. (You might want to make separate tests folder)

Lets take a look inside the 'src' folder

-`config` --> In this folder anything and everything regarding any configurations o setup of a library or module will be done. For examples setting up `dotenv` so that we can use the environment variables anywhere in a cleaner fashion, this is done in the `server-config.js`. One more example can be to setup you logging library that can help you to prepare meaningful logs, so configuration for this library should also be done here.

`routes` --> In the routes folder, we register a route and the corresponding middleware and controllers to it.

`middlewares` --> they are just going to intercept the incoming requests where we can write our validators, authenticators etc.

`controllers` --> they are kind of the last middlewares as post then you call you business layer to execute the budiness logic. In controllers we just receive the incoming requests and data and then pass it to the business layer, and once businer Layer returns an output, we structure the API response in controllers and send the output.

`repositories` --> This folder contains all the logic using which we interact the DB by writing queries, all the raw queries or ORM queries will go here.

`services` --> Contains the buisness logic and interacts with repositories for data from the database.

`utils` --> contains helper methods, error classes etc.

### Set Up the project.

Download this template from Github and open in your favourite code editor . 
In the root directory create a `.env` file and add the following env variable 
``` PORT = <Your port number> ```

inside `config -> config.json` write the code given below

{
  "development": {
    "username": "root",
    "password": null,
    "database": "database_development",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}

In `src` folder execute the following command 
```
npx sequelize init 
```
By executing this command you will automatically get the config.json , seeder folder and migration folder.
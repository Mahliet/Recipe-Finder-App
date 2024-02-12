/*****************************HEADERS *****************************/
const http = require("http");
const express = require("express"); /* Accessing express module */
const app = express(); /* app is a request handler function */
const path = require("path");
const bodyParser = require("body-parser"); /* To handle post parameters */
process.stdin.setEncoding("utf8");
let newUser = ""; 
let newUsername = "";
let availRecipesList = new Array();
let list = ""; 
/************API STUFF****************/
const axios = require('axios');



async function id(options){
  try {
    const response = await axios.request(options);
    return response;
    //console.log(response.data);
    //console.log(response.data.hits);
  } catch (error) {
    console.log("Recipe could not be found with the entered ingredients");
    process.exit(1);
  }
}



/************END API STUFF****************/

/******************************* MongoDB Header **********************/
//require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })
require("dotenv").config(__dirname);


const uri = process.env.MONGO_CONNECTION_STRING;

/*database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');
const e = require("express");

/************************** COMMAND LINE CODE ****************************/
// If port number is not provided

// Save portNumber
const portNumber = 4000;

console.log(`Web server and runing at http://localhost:${portNumber}`);
const prompt = "Stop to shutdown the server: ";
process.stdout.write(prompt);
process.stdin.on('readable', () => {  /* on equivalent to addEventListener */
    let dataInput = process.stdin.read();
    while (dataInput !== null) {
	    let command = dataInput.trim();
	    if (command == "stop") {
	    	console.log("Shutting down the server");
            process.exit(0);  /* exiting */
        }
        console.log("Type stop to shutdown the server");
        dataInput = process.stdin.read();
    }
});

app.get("/welcome.css", (_, res) => {
  res.type("css");
  res.sendFile(__dirname + "/welcome.css");
});
app.get("/lemon.jpg", (_, res) => {
  res.type("jpg");
  res.sendFile(__dirname + "/lemon.jpg");
});
//res.sendFile(__dirname + "/welcome.css");
//app.use("/cssfiles", express.static(__dirname + "/cssfiles"));
/* directory where templates will reside */
app.set("views", __dirname);

/* view/templating engine */
app.set("view engine", "ejs");

/* Initializes request.body with post information */ 
app.use(bodyParser.urlencoded({extended:false}));

app.get("/", (request, response) => { 
  response.render("welcomepage"); 
}); 

app.get("/returninguser", (request, response) => { 
  response.render("returningUser");
}); 

app.post("/returninguser", async (request, response) => {
  //need to retrieve the username based on the email provided from MongoDB
  let {newEmail} =  request.body;

  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

      await client.connect();
      let filter = {newEmail};
      newUser = newEmail;
      const cursor = client.db(databaseAndCollection.db)
      .collection(databaseAndCollection.collection)
      .find(filter);
      
      const result = await cursor.toArray();
      await client.close();

      let retUser = ``;
      
      if(result.length > 0) {
        retUser = result[0].newName;
        newUsername = result[0].newName;
    } else {
        
        retUser = "User Not Found";
        newUsername = "";
    }
      
      const variables = {
        username: ` back, ${retUser}`
      };

  response.render("ingredients", variables);
});

app.get("/newuser", (request, response) => { 
  response.render("newUser");
}); 

app.post("/newuser", async (request, response) => {
  //need to save the name of the user and email address as well in MongoDB
  let {newName, newEmail} =  request.body;

  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
  await client.connect();

  let newApp = {newName, newEmail, recipes: []};
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newApp);
  await client.close();
  newUser = newEmail;
  newUsername = newName; 
  response.render("ingredients", {username: `${newName}`});
});
app.get("/ingredients", (request, response) => { 
  // console.log(newUser);
  // console.log("here1");
}); 
app.post("/ingredients", async (request, response) =>{
  const l = request.body.ingredients;
  const options = {
    method: 'GET',
    url: 'https://edamam-recipe-search.p.rapidapi.com/api/recipes/v2',
    params: {
      type: 'public',
      co2EmissionsClass: 'A+',
      'field[0]': 'uri',
      q: l,
      beta: 'true',
      random: 'true',
      'cuisineType[0]': 'American',
      'imageSize[0]': 'LARGE',
      'mealType[0]': 'Breakfast',
      'health[0]': 'alcohol-cocktail',
      'diet[0]': 'balanced',
      'dishType[0]': 'Biscuits and cookies'
    },
    headers: {
      'Accept-Language': 'en',
      'X-RapidAPI-Key': 'f1ed4e35c3msh9e1f0b067458bf2p1f8efejsn13aa373c61ce',
      'X-RapidAPI-Host': 'edamam-recipe-search.p.rapidapi.com'
    }
  };
  const res = await id(options);
  //stop
  if (res.data.hits == undefined){
    process.exit(0);
  }
  list = `<table border="1"><tr><th>Receipe Name</th><th>Calories</th></tr>`;
  res.data.hits.forEach(element => {
    let fixed = element.recipe.calories.toFixed()
    list += `<tr><td>${element.recipe.label}</td><td>${fixed}</td></tr>`;
    availRecipesList.push(element.recipe.label);
    availRecipesList.push(element.recipe.label);
  });

  list += `</table>`;
  response.render("optionpage", {recipeList: list});

});

app.get("/optionpage", (request, response) => { 

}); 
app.post("/optionpage", async(request, response) =>{
  let table = `<table border="1"><tr><th>Receipe Name</th</tr>`;
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
  await client.connect();
  if (availRecipesList.includes(request.body.recipeList)){
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).updateOne({newEmail: newUser}, {$push: {recipes: request.body.recipeList}});
    const result2 = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({newEmail: newUser});

    result2.recipes.forEach(x => {
      table += `<tr><td>${x}</td></tr>`;

    });

  }
  table += `</table>`;
    //console.log(result);
  // const result2 = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({newEmail: newUser});
  // console.log(result2);
  await client.close();
  response.render("archives", {here: table});
});

app.get("/archives", async(request, response) => { 
  const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
  await client.connect();
  const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).findOne({newEmail: newUser});
  if (result) {
    response.render("archives", {name: result.name, email: result.email });
  } else {
    const vars = {
        name: 'NONE',
        email: 'NONE',
    };
    response.render("archives", vars);
  }
  await client.close();
});
app.post("/archives", (request, response) =>{
  response.render("optionpage", {recipeList: list});
});

app.listen(portNumber);

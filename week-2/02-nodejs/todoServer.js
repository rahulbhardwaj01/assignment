/**
  You need to create an express HTTP server in Node.js which will handle the logic of a todo list app.
  - Don't use any database, just store all the data in an array to store the todo list data (in-memory)
  - Hard todo: Try to save responses in files, so that even if u exit the app and run it again, the data remains (similar to databases)

  Each todo has a title and a description. The title is a string and the description is a string.
  Each todo should also get an unique autogenerated id every time it is created
  The expected API endpoints are defined below,
  1.GET /todos - Retrieve all todo items
    Description: Returns a list of all todo items.
    Response: 200 OK with an array of todo items in JSON format.
    Example: GET http://localhost:3000/todos
    
  2.GET /todos/:id - Retrieve a specific todo item by ID
    Description: Returns a specific todo item identified by its ID.
    Response: 200 OK with the todo item in JSON format if found, or 404 Not Found if not found.
    Example: GET http://localhost:3000/todos/123
    
  3. POST /todos - Create a new todo item
    Description: Creates a new todo item.
    Request Body: JSON object representing the todo item.
    Response: 201 Created with the ID of the created todo item in JSON format. eg: {id: 1}
    Example: POST http://localhost:3000/todos
    Request Body: { "title": "Buy groceries", "completed": false, description: "I should buy groceries" }
    
  4. PUT /todos/:id - Update an existing todo item by ID
    Description: Updates an existing todo item identified by its ID.
    Request Body: JSON object representing the updated todo item.
    Response: 200 OK if the todo item was found and updated, or 404 Not Found if not found.
    Example: PUT http://localhost:3000/todos/123
    Request Body: { "title": "Buy groceries", "completed": true }
    
  5. DELETE /todos/:id - Delete a todo item by ID
    Description: Deletes a todo item identified by its ID.
    Response: 200 OK if the todo item was found and deleted, or 404 Not Found if not found.
    Example: DELETE http://localhost:3000/todos/123

    - For any other route not defined in the server return 404

  Testing the server - run `npm run test-todoServer` command in terminal
 */
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;
const crypto = require("crypto");

const app = express();
app.use(bodyParser.json());

//get all todos route
app.get("/todos", async (req, res) => {
  try {
    const data = await fs.readFile("todos.json", "utf-8");
    const parsedNotes = JSON.parse(data);
    return res.status(200).send(parsedNotes);
  } catch (error) {
    return res.status(500).send("Error Reading Notes!", error);
  }
});

//create a new todo item route
app.post("/todos", async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).send({ message: "All fields are required!" });
  }
  const note = {
    title: title,
    completed: false,
    description: description,
    _id: crypto.randomBytes(16).toString("hex"),
  };
  const data = JSON.parse(await fs.readFile("todos.json", "utf-8"));
  data.push(note);
  await fs.writeFile("todos.json", JSON.stringify(data), (err) => {
    if (err) return res.status(500).send({ message: "Some Error Occured" });
  });
  return res.status(201).send({ todo: note });
});

//get a specific todo with id route
app.get("/todos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const data = JSON.parse(await fs.readFile("todos.json", "utf-8"));
    const todoElement = data.find((todo) => todo._id === id);
    if (!todoElement) {
      return res.status(404).send({ message: "Todo Not Found!" });
    }
    return res.status(200).send(todoElement);
  } catch (error) {
    return res.status(500).send("Error Finding The todo specified!", error);
  }
});

//update a specific todo with id route
app.put("/todos/:id", async (req, res) => {
  const id = req.params.id;
  const { title, completed, description } = req.body;
  try {
    const data = JSON.parse(await fs.readFile("todos.json", "utf-8"));
    const todoElement = data.find((todo) => todo._id === id);
    if (!todoElement) {
      return res.status(404).send({ message: "Todo Not Found!" });
    }
    if (!title && !description && !completed) {
      return res.status(400).send({ message: "No change was provided!" });
    }
    if (title) {
      todoElement.title = title;
    }
    if (description) {
      todoElement.description = description;
    }
    if (completed) {
      todoElement.completed = completed;
    }
    await fs.writeFile("todos.json", JSON.stringify(data), (err) => {
      if (err) throw err;
    });
    return res.status(200).send(todoElement);
  } catch (error) {
    throw error;
  }
});

app.delete("/todos/:id", async (req, res) => {
  const id = req.params.id;
  try {
    let data = JSON.parse(await fs.readFile("todos.json", "utf-8"));
    const filteredData = data.filter((todo) => todo._id !== id);
    if (filteredData.length === data.length) {
      return res.status(404).send({ message: "Todo not found!" });
    }
    data = filteredData;
    await fs.writeFile("todos.json", JSON.stringify(data), (err) => {
      if (err) return res.status(500).send("Error writing to file!");
    });
    return res.status(200).send({ message: "Todo deleted successfully" });
  } catch (error) {
    return res.status(500).send("Error Deleting The Todo");
  }
});

app.use((req, res, next) => {
  res.status(404).send();
});

app.listen(4000, () => {
  console.log("http://localhost:4000");
});

module.exports = app;

// const express = require('express');
// const bodyParser = require('body-parser');
// const fs = require("fs");

// const app = express();

// app.use(bodyParser.json());

// function findIndex(arr, id) {
//   for (let i = 0; i < arr.length; i++) {
//     if (arr[i].id === id) return i;
//   }
//   return -1;
// }

// function removeAtIndex(arr, index) {
//   let newArray = [];
//   for (let i = 0; i < arr.length; i++) {
//     if (i !== index) newArray.push(arr[i]);
//   }
//   return newArray;
// }

// app.get('/todos', (req, res) => {
//   fs.readFile("todos.json", "utf8", function(err, data) {
//     if (err) throw err;
//     res.json(JSON.parse(data));
//   });
// });

// app.get('/todos/:id', (req, res) => {
//   fs.readFile("todos.json", "utf8", function(err, data) {
//     if (err) throw err;
//     const todos = JSON.parse(data);
//     const todoIndex = findIndex(todos, parseInt(req.params.id));
//     if (todoIndex === -1) {
//       res.status(404).send();
//     } else {
//       res.json(todos[todoIndex]);
//     }
//   });
// });

// app.post('/todos', function(req, res) {
//   const newTodo = {
//     id: Math.floor(Math.random() * 1000000), // unique random id
//     title: req.body.title,
//     description: req.body.description
//   };
//   fs.readFile("todos.json", "utf8", (err, data) => {
//     if (err) throw err;
//     const todos = JSON.parse(data);
//     todos.push(newTodo);
//     fs.writeFile("todos.json", JSON.stringify(todos), (err) => {
//       if (err) throw err;
//       res.status(201).json(newTodo);
//     });
//   });
// });

// app.put('/todos/:id', function(req, res) {
//   fs.readFile("todos.json", "utf8", (err, data) => {
//     if (err) throw err;
//     const todos = JSON.parse(data);
//     const todoIndex = findIndex(todos, parseInt(req.params.id));
//     if (todoIndex === -1) {
//       res.status(404).send();
//     } else {
//       const updatedTodo = {
//         id: todos[todoIndex].id,
//         title: req.body.title,
//         description: req.body.description
//       };
//       todos[todoIndex] = updatedTodo;
//       fs.writeFile("todos.json", JSON.stringify(todos), (err) => {
//         if (err) throw err;
//         res.status(200).json(updatedTodo);
//       });
//     }
//   });
// });

// app.delete('/todos/:id', function(req, res) {

//   fs.readFile("todos.json", "utf8", (err, data) => {
//     if (err) throw err;
//     let todos = JSON.parse(data);
//     const todoIndex = findIndex(todos, parseInt(req.params.id));
//     if (todoIndex === -1) {
//       res.status(404).send();
//     } else {
//       todos = removeAtIndex(todos, todoIndex);
//       fs.writeFile("todos.json", JSON.stringify(todos), (err) => {
//         if (err) throw err;
//         res.status(200).send();
//       });
//     }
//   });
// });

// // for all other routes, return 404
// app.use((req, res, next) => {
//   res.status(404).send();
// });

// module.exports = app;

const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const user = users.find(user => user.username === username);

  if(!user){
    response.status(404).json({error: "User not found"}).send();
  }

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userExists = users.some(user => user.username === username);

  if(userExists){
    response.status(400).json({ error: "User already exists" });
  }

  const userData = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(userData);
  response.status(201).json(userData).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.json(user.todos).send();
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const newTodo = {
      id: uuidv4(),
      title,
      done: false, 
      deadline: new Date(deadline), 
      created_at: new Date()
  };
  user.todos.push(newTodo);
  response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;
  let todoIndex = -1;
  let toDo = user.todos.find((todo, index) => {
    todoIndex = index;
    return todo.id === id;
  });

  if(!toDo){
    response.status(404).json({ error: "To do not found"}).send();
  }

  toDo = {
    ...toDo,
    title,
    deadline
  }

  user.todos[todoIndex] = toDo;

  response.json(toDo).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  let todoIndex = -1;
  let toDo = user.todos.find((todo, index) => {
    todoIndex = index;
    return todo.id === id;
  });

  if(!toDo){
    response.status(404).json({ error: "To do not found"}).send();
  }

  toDo = {
    ...toDo,
    done: true,
  };

  user.todos[todoIndex] = toDo;

  response.json(toDo).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  let todoIndex = -1;
  let toDo = user.todos.find((todo, index) => {
    todoIndex = index;
    return todo.id === id;
  });

  if(!toDo){
    response.status(404).json({ error: "To do not found"}).send();
  }

  user.todos.splice(todoIndex,1);

  response.status(204).send();
});

module.exports = app;
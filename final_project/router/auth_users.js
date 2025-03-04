const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js');
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const user = users.find((user) => user.username === username);
  if (user === undefined) {
    return true;
  }
  return false;
};

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  return validusers.length > 0 ? true : false;
};

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(404).json({ messae: 'Error logging in' });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      'access',

      { expiresIn: 60 * 62 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    console.log(req.session);

    return res.status(200).send('User successfully logged in');
  } else {
    return res.status(208).json({ message: 'Invalid crendentials' });
  }
});

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;

  let book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'This book does not exist' });
  }

  // get the username from the session
  let username = req.session.authorization.username;

  book.reviews[username] = review;
  books[isbn] = book;

  return res.status(201).json({ message: 'Review updated' });
});

// Logout a user
regd_users.get('/logout', (req, res) => {
  if (req.session.authorization) {
    req.session.destroy();
    return res.status(200).json({ message: 'User logged out' });
  } else {
    return res.status(404).json({ message: 'User not logged in' });
  }
});

// delete a book review added by the user
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  let book = books[isbn];

  if (!book.reviews) {
    return res.status(404).json({ message: 'No reviews' });
  }

  // get the username from the session
  let username = req.session.authorization.username;
  delete book.reviews[username];

  books[isbn] = book;
  return res.status(200).json({ message: 'Review deleted' });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

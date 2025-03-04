const express = require('express');
let books = require('./booksdb.js');
let isValid = require('./auth_users.js').isValid;
let users = require('./auth_users.js').users;
const public_users = express.Router();

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(404)
      .json({ message: 'username and password are requireds' });
  } else if (isValid(username)) {
    users.push({ username, password });
    return res.status(201).json({ message: 'user successfully created' });
  } else {
    return res.status(404).json({ message: 'Username alredy exist!' });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).json({ books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!isbn) {
    return res.status(404).json({ message: 'isbn is required' });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'book not found' });
  }

  return res.status(200).json({ book });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const values = Object.values(books);
  const author = req.params.author;

  if (!author) {
    return res.status(404).json({ message: 'author is required' });
  }

  const filteredBooksByAuthor = values.filter(
    (value) => value.author === author
  );

  return res.status(200).json({ books: filteredBooksByAuthor });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  if (!title) {
    return res.status(404).json({ message: 'title is required' });
  }

  const values = Object.values(books);

  const filteredBooksByTitle = values.filter((value) => value.title === title);

  return res.status(200).json({ books: filteredBooksByTitle });
});

//  Get book reviews asynchoronously
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (!isbn) {
    return res.status(404).json({ message: 'isbn is required' });
  }

  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: 'Inavalid isbn ' });
  } else {
    return res.status(200).json({ reviews: book.reviwes });
  }
});

public_users.get('/books', async function (req, res) {
  try {
    const booksList = await new Promise((resolve) => {
      resolve(books);
    });
    res.status(200).json({ books: booksList });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

public_users.get('/books/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (!isbn) {
      reject('isbn is required');
    }

    const book = books[isbn];
    if (!book) {
      reject('book not found');
    }

    resolve(book);
  });

  getBookByISBN
    .then((book) => {
      res.status(200).json({ book });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

public_users.get('/books/author/:author', (req, res) => {
  const author = req.params.author;

  const getBooksByAuthor = new Promise((resolve, reject) => {
    if (!author) {
      reject('author is required');
    }

    const filteredBooks = Object.values(books).filter(
      (value) => value.author === author
    );

    if (filteredBooks.length === 0) {
      reject('No books found for this author');
    }

    resolve(filteredBooks);
  });

  getBooksByAuthor
    .then((filteredBooks) => {
      res.status(200).json({ books: filteredBooks });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

public_users.get('/books/title/:title', (req, res) => {
  const title = req.params.title;

  const getBooksByTitle = new Promise((resolve, reject) => {
    if (!title) {
      reject('title is required');
    }

    const filteredBooks = Object.values(books).filter(
      (book) => book.title === title
    );

    if (filteredBooks.length === 0) {
      reject('No books found with this title');
    }

    resolve(filteredBooks);
  });

  getBooksByTitle
    .then((filteredBooks) => {
      res.status(200).json({ books: filteredBooks });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

public_users.get('/books/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  const getReviewsByISBN = new Promise((resolve, reject) => {
    if (!isbn) {
      reject('isbn is required');
    }

    const book = books[isbn];
    if (!book) {
      reject('Invalid isbn');
    }

    resolve(book.reviews);
  });

  getReviewsByISBN
    .then((reviews) => {
      res.status(200).json({ reviews });
    })
    .catch((error) => {
      res.status(404).json({ message: error });
    });
});

module.exports.general = public_users;

const axios = require('axios');
const express = require('express');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

// TASK 6 - REGISTER
public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password) {
    return res.status(404).json({ message: "Please enter a valid username and password." });
  }

  if (username && password) {
    if (!doesExist(username)) {
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registered! Now you can login."});
    } else {
        return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});


// TASK 10 - GET all books available in shop using Promises
const getBooks = () => {
    return new Promise((resolve, reject) => {
      try {
        resolve({ books: books, message: "These are all the books available." });
      } catch (error) {
        console.error(error);
        reject("Internal Server Error");
      }
    });
  };
  
  public_users.get('/', function (req, res) {
    getBooks()
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        res.status(500).json({ message: error });
      });
  });

// TASK 2 - Get book details based on ISBN
// public_users.get('/isbn/:isbn', function (req, res) {
//     const isbn = req.params.isbn;
  
    // Check if the provided ISBN exists in the books object
    // if (books[isbn]) {
      // Sending the book corresponding to the ISBN as a response with a custom message
    //   res.status(200).json({ book: books[isbn], message: "Book corresponding to the ISBN found" });
    // } else {
      // If ISBN is not found, send a custom message
//       res.status(404).json({ message: "Book with the specified ISBN not found" });
//     }
//   });

// TASK 11 - GET book details by ISBN using Promises  
const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      try {
        if (books[isbn]) {
          // Sending the book corresponding to the ISBN as a response with a custom message
          resolve({ book: books[isbn], message: "Book corresponding to the ISBN found" });
        } else {
          // If ISBN is not found, send a custom message
          reject({ message: "Book with the specified ISBN not found" });
        }
      } catch (error) {
        console.error(error);
        reject("Internal Server Error");
      }
    });
  };

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});
  
// TASK 3 - Get book details based on author
// public_users.get('/author/:author', function (req, res) {
//     const author = req.params.author;
  
//     Step 1: Iterate through the values of the 'books' object
//     const matchingAuthor = Object.values(books).filter((book) => book.author === author);
  
//     Check if there are matching books
//     if (matchingAuthor.length > 0) {
//       Sending the matching books as a response with a custom message and status code
//       res.status(200).json({ books: matchingAuthor, message: "Books by the specified author found" });
//     } else {
//       If no matching books are found, send a custom message and status code
//       res.status(404).json({ message: "No books found by the specified author" });
//     }
//   });

// TASK 12 - GET book by Author using Promises  
const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      try {
        const matchingBooks = Object.values(books).filter((book) => book.author === author);
        if (matchingBooks.length > 0) {
          resolve({ books: matchingBooks, message: "Books by the specified author found" });
        } else {
          reject({ message: "No books found by the specified author" });
        }
      } catch (error) {
        console.error(error);
        reject("Internal Server Error");
      }
    });
  };
  
  public_users.get('/author/:author', function (req, res) {
    const author = req.params.author;
    getBooksByAuthor(author)
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  });

// TASK 4 - Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;
//   const matchingTitle = Object.values(books).filter((book) => book.title === title);
//   if (matchingTitle.length > 0) {
//     res.status(200).json({ books: matchingTitle, message: "Books with the specified title found" });
//   } else {
//     res.status(404).json({ message: "No books found with the specified title" });
//   }
// });

// TASK 13 - GET books by title using Promises
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    try {
      const matchingBooks = Object.values(books).filter((book) => book.title === title);
      if (matchingBooks.length > 0) {
        resolve({ books: matchingBooks, message: "Books with the specified title found" });
      } else {
        reject({ message: "No books found with the specified title" });
      }
    } catch (error) {
      console.error(error);
      reject("Internal Server Error");
    }
  });
};

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title)
    .then((data) => {
      res.status(200).json(data);
    })
    .catch((error) => {
      res.status(404).json(error);
    });
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
      if (books[isbn]) {
      const bookReviews = books[isbn].reviews;
      res.status(200).json({ reviews: bookReviews, message: "Book reviews by ISBN" });
    } else {
      res.status(404).json({ message: "Book with the specified ISBN not found" });
    }
  });
  
module.exports.general = public_users;
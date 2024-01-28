const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const authenticatedUser = (username,password)=>{
// Checks if username and password match the one we have in records.
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
};

const isAuthenticated = (req) => {
    // Your authentication logic here, for example, using sessions or JWT tokens
    return req.session && req.session.authorization && req.session.authorization.username;
  };

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
  
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("Customer successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  });

// TASK 8 - Add or modify a book review
regd_users.put("/auth/review/:isbn", function auth(req, res, next) {
    // Middleware which tells that the user is authenticated or not
    if (isAuthenticated(req)) {
      let token = req.session.authorization.accessToken; // Access Token
  
      jwt.verify(token, "access", (err, user) => {
        if (!err) {
          req.user = user;
          next();
        } else {
          return res.status(403).json({ message: "User not authenticated" });
        }
      });
    } else {
      return res.status(403).json({ message: "User not logged in" });
    }
  }, (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
  
    // Check if the provided ISBN exists in the books object
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book with the specified ISBN not found" });
    }
  
    // Check if the book already has a review by the same user
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // Modify existing review
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json("The review for ISBN " + [isbn] + " has been modified successfully.");
    } else {
      // Add a new review
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
      books[isbn].reviews[username] = reviewText;
      return res.status(200).json("Review added successfully");
    }
  });

// TASK 9 - Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username; // Get the username from the session

    // Ensure there is a valid isbn & valid username
    if (!isbn || !username) {
        return res.status(400).json({ message: "Invalid request. Please provide ISBN and ensure you are logged in." });
    }

    // Check if the book with the specified ISBN exists
    if (books[isbn]) {
        // Check if the book has reviews
        if (books[isbn].reviews) {
            // Check if the user has a review for the specified ISBN
            if (books[isbn].reviews[username]) {
                // Filter out the user's review and update the reviews object
                books[isbn].reviews = Object.fromEntries(
                    Object.entries(books[isbn].reviews).filter(([key, value]) => key !== username)
                );

                return res.status(200).json("Reviews for ISBN " + [isbn] + " posted by " + [username] + " deleted successfully");
            } else {
                return res.status(404).json({ message: "No review found for the specified ISBN and user" });
            }
        } else {
            return res.status(404).json({ message: "No reviews found for the specified ISBN" });
        }
    } else {
        return res.status(404).json({ message: "Book with the specified ISBN not found" });
    }
});



module.exports.authenticated = regd_users;
module.exports.users = users;

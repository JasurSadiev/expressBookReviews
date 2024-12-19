const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// User registration
public_users.post("/register", (req, res) => {
	const { username, password } = req.body;

	// Check if username and password are provided
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	// Check if the user already exists
	const userExists = users.some((user) => user.username === username);
	if (userExists) {
		return res.status(409).json({ message: "User already exists" });
	}

	// Register the new user
	users.push({ username, password });
	return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
	return res.status(200).json(books);
});

public_users.get("/promise", function (req, res) {
	axios
		.get("http://localhost:5000") // Replace with the API endpoint or logic
		.then((response) => {
			res.status(200).json(response.data);
		})
		.catch((error) => {
			res.status(500).json({ error: error.message });
		});
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
	const { isbn } = req.params;
	const book = books[isbn];

	if (book) {
		return res.status(200).json(book);
	} else {
		return res.status(404).json({ message: "Book not found" });
	}
});

public_users.get("/promise/isbn/:isbn", function (req, res) {
	const { isbn } = req.params;
	axios
		.get(`http://localhost:5000/books/${isbn}`) // Replace with the API endpoint or logic
		.then((response) => {
			res.status(200).json(response.data);
		})
		.catch((error) => {
			res.status(404).json({ error: error.message });
		});
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
	const { author } = req.params;
	const matchingBooks = [];

	// Loop through books to find matches by author
	for (const key in books) {
		if (books[key].author.toLowerCase() === author.toLowerCase()) {
			matchingBooks.push(books[key]);
		}
	}

	if (matchingBooks.length > 0) {
		return res.status(200).json(matchingBooks);
	} else {
		return res.status(404).json({ message: "No books found for this author" });
	}
});

// Using Promise callbacks
public_users.get("/promise/author/:author", function (req, res) {
	const { author } = req.params;
	axios
		.get(`http://localhost:5000/books?author=${author}`) // Replace with the API endpoint or logic
		.then((response) => {
			res.status(200).json(response.data);
		})
		.catch((error) => {
			res.status(404).json({ error: error.message });
		});
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
	const { title } = req.params;
	const matchingBooks = [];

	// Loop through books to find matches by title
	for (const key in books) {
		if (books[key].title.toLowerCase() === title.toLowerCase()) {
			matchingBooks.push(books[key]);
		}
	}

	if (matchingBooks.length > 0) {
		return res.status(200).json(matchingBooks);
	} else {
		return res.status(404).json({ message: "No books found with this title" });
	}
});

public_users.get("/promise/title/:title", function (req, res) {
	const { title } = req.params;
	axios
		.get(`http://localhost:5000/books?title=${title}`) // Replace with the API endpoint or logic
		.then((response) => {
			res.status(200).json(response.data);
		})
		.catch((error) => {
			res.status(404).json({ error: error.message });
		});
});

// Get book reviews
public_users.get("/review/:isbn", function (req, res) {
	const { isbn } = req.params;
	const book = books[isbn];

	if (book && book.reviews) {
		return res.status(200).json(book.reviews);
	} else {
		return res.status(404).json({ message: "No reviews found for this book" });
	}
});

module.exports.general = public_users;

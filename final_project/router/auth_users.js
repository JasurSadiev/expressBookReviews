const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js"); // Your books database
const regd_users = express.Router();

let users = [];

// Function to check if username is valid
const isValid = (username) => {
	return users.some((user) => user.username === username);
};

// Function to authenticate username and password
const authenticatedUser = (username, password) => {
	const user = users.find(
		(user) => user.username === username && user.password === password
	);
	return user ? true : false;
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
	const token = req.headers["authorization"];
	console.log(token);
	if (!token) {
		return res
			.status(401)
			.json({ message: "Access denied. No token provided." });
	}

	try {
		const SECRET_KEY = process.env.SECRET_KEY || "defaultsecret";
		const decoded = jwt.verify(token, SECRET_KEY);
		req.username = decoded.username; // Attach username to request object
		next();
	} catch (err) {
		return res.status(403).json({ message: "Invalid token." });
	}
};

// Middleware to parse JSON in requests (to be used in main server file)
regd_users.use(express.json());

// Endpoint to login registered users
regd_users.post("/login", (req, res) => {
	const { username, password } = req.body;

	// Validate input
	if (!username || !password) {
		return res
			.status(400)
			.json({ message: "Username and password are required" });
	}

	// Authenticate the user
	if (authenticatedUser(username, password)) {
		const SECRET_KEY = process.env.SECRET_KEY || "your_jwt_secret_key";
		const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
		req.session.token = token;

		return res.status(200).json({
			message: "Login successful",
			token: token,
		});
	} else {
		return res.status(401).json({ message: "Invalid username or password" });
	}
});

// Endpoint to add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
	const { isbn } = req.params;
	const { review } = req.body;

	// Validate token and extract username
	const username = req.user.username;

	// Check if the book exists
	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	// Initialize reviews object if it doesn't exist
	if (!books[isbn].reviews) {
		books[isbn].reviews = {};
	}

	// Add or update the review
	books[isbn].reviews[username] = review;

	return res.status(200).json({
		message: "Review added/updated successfully",
		reviews: books[isbn].reviews,
	});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
	const { isbn } = req.params;
	const username = req.user.username;

	if (!books[isbn]) {
		return res.status(404).json({ message: "Book not found" });
	}

	// Check if the review exists for the user and delete it
	if (books[isbn].reviews && books[isbn].reviews[username]) {
		delete books[isbn].reviews[username];

		return res.status(200).json({
			message: "Review deleted successfully",
			book: books[isbn],
		});
	} else {
		return res
			.status(404)
			.json({ message: "Review not found for the given user." });
	}
});

// Prepopulate the users array for testing
users.push({ username: "testuser", password: "password123" });

// Export the modules
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

// Configure session middleware
app.use(
	"/customer",
	session({
		secret: "fingerprint_customer",
		resave: true,
		saveUninitialized: true,
	})
);

// Middleware for authenticating users based on session
app.use("/customer/auth/*", function auth(req, res, next) {
	// Extract token from session
	const token = req.session.token;
	if (!token) {
		return res.status(401).json({ message: "Unauthorized: No token provided" });
	}

	// Verify the token
	jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
		if (err) {
			return res.status(401).json({ message: "Unauthorized: Invalid token" });
		}

		// Attach user info to the request object for use in routes
		req.user = decoded;
		next();
	});
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

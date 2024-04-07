const express = require("express");
// init app & middleware
const app = express();
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");
app.use(express.json());

// db connection

let db;
connectToDb((err) => {
	if (!err) {
		app.listen(3000, () => {
			console.log("Server is live at port 3000!");
		});
		db = getDb();
	}
});

// Routes
app.get("/books", (req, res) => {
	const page = req.query.p || 0;
	const booksPerPage = 3;

	let books = [];
	db.collection("Book")
		.find()
		.sort({ author: 1 })
		.skip(page * booksPerPage)
		.limit(booksPerPage)
		.forEach((book) => books.push(book))
		.then(() => {
			res.status(200).json(books);
		})
		.catch(() => {
			res.status(500).json({
				error: "Could not fetch the document",
			});
		});
});

app.get("/books/:id", (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		db.collection("Book")
			.findOne({ _id: new ObjectId(req.params.id) })
			.then((doc) => {
				res.status(200).json(doc);
			})
			.catch((err) => {
				res.status(500).json({ error: "Could not fetch the docuent" });
			});
	} else {
		res.status(500).json({ error: "Not a valid document Id" });
	}
});

app.post("/books", (req, res) => {
	const book = req.body;
	db.collection("Book")
		.insertOne(book)
		.then((result) => {
			res.status(201).json(result);
		})
		.catch((err) => {
			res.status(500).json({ err: "Could not create a new document" });
		});
});

app.delete("/books/:id", (req, res) => {
	if (ObjectId.isValid(req.params.id)) {
		db.collection("Book")
			.deleteOne({ _id: new ObjectId(req.params.id) })
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				res.status(500).json({ error: "Could not delete the document" });
			});
	} else {
		res.status(500).json({ error: "Not a valid document Id" });
	}
});

app.patch("/books/:id", (req, res) => {
	const updates = req.body;
	if (ObjectId.isValid(req.params.id)) {
		db.collection("Book")
			.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
			.then((result) => {
				res.status(200).json(result);
			})
			.catch((err) => {
				res.status(500).json({ error: "Could not update the document" });
			});
	} else {
		res.status(500).json({ error: "Not a valid document Id" });
	}
});

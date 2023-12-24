const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 9100;
// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `${process.env.Mongo_URI}`;

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		const productsCollection = client
			.db("devtown-project")
			.collection("products");

		// >> products api
		app.post("/products", async (req, res) => {
			const products = req.body;
			products.createdAt = new Date();
			const result = await productsCollection.insertOne(products);
			res.send(result);
		});

		app.get("/products", async (req, res) => {
			const cursor = productsCollection.find().sort({ price: 1 });
			const result = await cursor.toArray();
			res.send(result);
		});

		app.get("/products", async (req, res) => {
			let query = {};

			if (req.query?.productName) {
				query.productName = {
					$regex: req.query.productName,
					$options: "i",
				};
			}
			if (req.query?.brand) {
				query.brand = {
					$regex: req.query.brand,
					$options: "i",
				};
			}
			if (req.query?.processor) {
				query.processor = {
					$regex: req.query.processor,
					$options: "i",
				};
			}
			if (req.query?.memory) {
				if (
					[
						"2 GB",
						"3 GB",
						"4 GB",
						"6 GB",
						"8 GB",
						"12 GB",
						"16 GB",
						"32 GB",
					].includes(req.query.memory)
				) {
					query.memory = req.query.memory;
				} else {
					query.memory = {
						$regex: req.query.memory,
						$options: "i",
					};
				}
			}
			if (req.query?.storage) {
				if (
					[
						"4 GB",
						"6 GB",
						"8 GB",
						"12 GB",
						"16 GB",
						"32 GB",
						"64 GB",
						"128 GB",
						"256 GB",
						"512 GB",
						"1 TB",
					].includes(req.query.storage)
				) {
					query.storage = req.query.storage;
				} else {
					query.storage = {
						$regex: req.query.storage,
						$options: "i",
					};
				}
			}
			if (req.query?.brand) {
				const validBrands = [
					"Apple",
					"BlackBurry",
					"BlackMagic",
					"Google",
					"Huawei",
					"Honor",
					"Infinix",
					"Itel",
					"IQOO",
					"Motorola",
					"OnePlus",
					"Oppo",
					"Realme",
					"Redmi",
					"Samsung",
					"Symphony",
					"Sony",
					"Tecno",
					"Vivo",
					"Walton",
					"Xiaomi",
				];
				if (validBrands.includes(req.query.brand)) {
					query.brand = req.query.brand;
				} else {
					query.brand = {
						$regex: req.query.brand,
						$options: "i",
					};
				}
			}

			const sortOptions = {};

			if (req.query?.sortField) {
				sortOptions[req.query.sortField] =
					req.query.sortOrder === "asc" ? 1 : -1;
			} else {
				sortOptions.price = 1;
			}

			const result = await productsCollection
				.find(query)
				.sort(sortOptions)
				.toArray();
			res.send(result);
		});

		app.get("/products/:id", async (req, res) => {
			const id = req.params.id;
			try {
				const queryWithObjectId = { _id: new ObjectId(id) };
				const result = await productsCollection.findOne(
					queryWithObjectId
				);

				if (!result) {
					const queryWithoutObjectId = { _id: id };
					const fallbackResult = await productsCollection.findOne(
						queryWithoutObjectId
					);

					if (!fallbackResult) {
						res.status(404).send("Product not found");
						return;
					}

					res.send(fallbackResult);
					return;
				}

				res.send(result);
			} catch (error) {
				console.error("Error:", error);
				res.status(500).send("Internal Server Error");
			}
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You are successfully connected to MongoDB!"
		);
	} finally {
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("devtown server is running!");
});

app.listen(port, () => {
	console.log(`devtown server is live on port ${port}`);
});

require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

async function main() {
  if (!dbUrl) {
    throw new Error("ATLASDB_URL is missing. Check .env path and variable name.");
  }
  await mongoose.connect(dbUrl);
  console.log("connected to DB ATLAS");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const ownerId = new mongoose.Types.ObjectId("6968506a67a7c5885e6c0c1c");

  const data = initData.data.map((obj) => ({
    ...obj,
    owner: ownerId,
  }));

  await Listing.insertMany(data);
  console.log("data was initialized");
};

main()
  .then(initDB)
  .then(() => mongoose.connection.close())
  .catch((err) => {
    console.error(err);
    mongoose.connection.close();
  });

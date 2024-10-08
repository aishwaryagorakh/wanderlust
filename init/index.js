require("dotenv").config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const dburl = process.env.MONGO_URL;
//const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlusts";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dburl);
}

const initDB = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "66b6817ec59cb036b1a29627",
  }));
  await Listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();

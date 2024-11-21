const PRODUCTMODEL = require("../models/productModel");

const addProduct = async (req, res) => {
  //   console.log(req.body);
  try {
    console.log("sssssss", req.body);
    const newBook = await PRODUCTMODEL.create({
      title: req.body?.title,
      author: req.body?.author,
      genre: req.body?.genre,
      year: req.body?.year,
      rating: req.body?.rating,
      isSeries: req.body?.isSeries,
      category: req.body?.category,
      description: req.body?.description,
      price: req.body?.price,
      priceDiscount: req.body?.priceDiscount || 0,
      image: req.body?.image || "Image Could Not be saved",
    });
    res.status(201).json({
      status: "success",
      data: {
        book: newBook,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ status: "fail", message: err });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await PRODUCTMODEL.find();
    res.status(200).json({
      status: "success",
      data: {
        products,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ status: "fail", message: err });
  }
};

module.exports = {
  addProduct,
  getProducts,
};

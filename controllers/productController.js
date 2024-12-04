const PRODUCTMODEL = require("../models/productModel");

const addProduct = async (req, res) => {
  console.log(req.body);
  try {
    // console.log("sssssss", req.body);
    const newBook = await PRODUCTMODEL.create({
      title: req.body?.title,
      author: req.body?.author,
      genre: req.body?.genre,
      year: req.body?.year,
      language: req.body?.language,
      binding: req.body?.binding,
      rating: req.body?.rating,
      isSeries: req.body?.isSeries,
      category: req.body?.category,
      description: req.body?.description,
      price: req.body?.price,
      priceDiscount: req.body?.discount || 0,
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

const getAllProducts = async (req, res) => {
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

const productDetail = async (req, res) => {
  const { category } = req.params;
  console.log(category);
  try {
    const productData = await PRODUCTMODEL.findById();
    res.status(200).json({
      status: "success",
      data: productData,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ status: "fail", message: err });
  }
};
const getProductByCategory = async (req, res) => {
  console.log(req.query);
  try {
    const { category } = req.query;
    const Book = await PRODUCTMODEL.find({ category: category });
    res.status(200).json({
      status: "success",
      data: Book,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({ status: "fail", message: err });
  }
};

const searchProduct = async (req, res) => {
  let proname = req.query.product;
  console.log(proname);
  const Data = await PRODUCTMODEL.find({
    name: { $regex: proname, $options: "i" },
  });
  res.send(Data);
};

module.exports = {
  addProduct,
  getAllProducts,
  productDetail,
  getProductByCategory,
  searchProduct,
};

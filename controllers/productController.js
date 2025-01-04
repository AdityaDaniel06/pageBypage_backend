const Razorpay = require("razorpay");
const crypto = require("crypto");
const PRODUCTMODEL = require("../models/productModel");
const PAYMENTMODEL = require("../models/paymentModel");

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
  // console.log(category);
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
  // console.log(req.query);
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

// razor pay
const order = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_PUBLISHABLE_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
  });

  try {
    const options = {
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: crypto.randomBytes(10).toString("hex"),
      payment_capture: 1,
    };

    razorpay.orders.create(options, (err, order) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
      }
      res.status(200).json(order);
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.message });
  }
};

const verify = async (req, res) => {
  try {
    const { razorpay_orderID, razorpay_paymentID, razorpay_signature } =
      req.body;

    const sign = razorpay_orderID + "|" + razorpay_paymentID;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const payment = new PAYMENTMODEL({
        razorpay_orderID,
        razorpay_paymentID,
        razorpay_signature,
      });

      await payment.save();
      res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  productDetail,
  getProductByCategory,
  searchProduct,
  order,
  verify,
};

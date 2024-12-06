'use strict';

const mongoose = require("mongoose");
require("dotenv").config;
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const {Schema} = mongoose;
const StockSchema = new Schema({
  symbol: {
    type: String, required: true},
  likes: {
    type: [String], default: []
  }
});
const Stock = mongoose.model("Stock", StockSchema);
//const fetch = require("node-fetch");

async function create_stock(stock, like, ip){
  const newLike = like ? [ip] : [];
  const newStock = new Stock({
    symbol: stock,
    likes: newLike
  });
  const saveNewStock = await newStock.save();
  return saveNewStock;
}

async function find_stock(stock){
  const findNewStock = Stock.findOne({symbol: stock}).exec();
  return await findNewStock;
}

async function save_stock(stock, like, ip){
  let savedStock = {};
  const foundStock = await find_stock(stock);
  if(foundStock === null){
    const createSavedStock = await create_stock(stock, like, ip);
    savedStock = createSavedStock;
    return savedStock;
  }else{
    const findLike = foundStock.likes.indexOf(ip);
    if(like && findLike === -1){
      foundStock.likes.push(ip);
    }else{
      savedStock = await foundStock.save();
      return savedStock;
    }
  }
}

async function get_stock(stock){
  const stock_url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  const res = await fetch(stock_url);
  return await res.json();
}
module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(async function (req, res){
      const {stock} = req.query;
      const {like} = req.query;
      if (stock.constructor === Array) {
        try{
          console.log("Stocks: ", stock);
  
          const {symbol} = await get_stock(stock[0]);
          const {symbol2} = await get_stock(stock[1]);
          const {latestPrice} = await get_stock(stock[0]);
          const {latestPrice2} = await get_stock(stock[1]);
    
          const firstStockData = await save_stock(stock[0], like, req.ip);
          const secondStockData = await save_stock(stock[1], like, req.ip);
    
          let stockData = [];
          const firstStockDataLength = firstStockData.likes.length - secondStockData.likes.length;
          const secondStockDataLength = secondStockData.likes.length - firstStockData.likes.length;
          if (symbol === null) {
            stockData.push({
              rel_likes: firstStockDataLength
            });
          } else {
            stockData.push({
              stock: symbol,
              price: latestPrice,
              rel_likes: firstStockDataLength
            });
          }
    
          if (symbol2 === null) {
            stockData.push({
              rel_likes: secondStockDataLength
            });
          } else {
            stockData.push({
              stock: symbol2,
              price: latestPrice2,
              rel_likes: secondStockDataLength
            });
          }
          res.json({
            stockData
          });
          return;
        }catch(err){
          console.log(err);
          res.json({error: "Invalid stock data"});
        }
      }
      const {symbol} = await get_stock(stock);
      const {latestPrice} = await get_stock(stock);
      if (symbol === null){
        try{
          const data = {
            stockData: {
              likes: like ? 1 : 0
            }
          }
          res.json(data);
          return;
        }catch(err){
          console.log(err);
          res.json({error: "Invalid stock data"});
        }
      }
      
      try{
        const saveStockData = await save_stock(symbol, like, req.ip);
        console.log("Stock Data: ", saveStockData);
        res.json({
          stockData: {
            stock: symbol,
            price: latestPrice,
            likes: saveStockData.likes.length,
          },
        });
      }catch(err){
        console.log(err);
        res.json({error: "Invalid stock data"});
      }
    });
};

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const stock_api = "/api/stock-prices/";

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite("GET request to /api/stock-prices/", () => {
    test("Viewing one stock", (done) => {
      chai
      .request(server)
      .get(stock_api)
      .query({stock: "GOOG"})
      .end((err, res) => {
        assert.deepEqual(
          res.status, 200,
          res.body.stockData.stock, "GOOG",
          res.body.stockData.price,
          res.body.stockData.likes
        );
        done();
      });
    });
    test("Viewing one stock and liking it", (done) => {
      chai
      .request(server)
      .get(stock_api)
      .query({stock: "GOLD", like: true})
      .end((err, res) => {
        assert.deepEqual(
          res.status, 200,
          res.body.stockData.stock, "GOLD",
          res.body.stockData.price,
          res.body.stockData.likes, 1
        );
        done();
      });
    });
    test("Viewing the same stock and liking it again", (done) => {
      chai
      .request(server)
      .get(stock_api)
      .query({stock: "GOLD", like: true})
      .end((err, res) => {
        assert.deepEqual(
          res.status, 200,
          res.body.stockData.stock, "GOLD",
          res.body.stockData.price,
          res.body.stockData.likes, 1
        );
        done();
      });
    });
    test("Viewing two stocks", (done) => {
      chai
      .request(server)
      .get(stock_api)
      .query({stock: ["GOOG","MSFT"]})
      .end((err, res) => {
        assert.deepEqual(
          res.status, 200,
          res.body.stockData[0].stock, "GOOG",
          res.body.stockData[0].price,
          res.body.stockData[1].stock, "MSFT",
          res.body.stockData[1].price
        );
        done();
      });
    });
    test("Viewing two stocks and liking them", (done) => {
      chai
      .request(server)
      .get(stock_api)
      .query({stock: ["GOLD","TWIT"], like: true})
      .end((err, res) => {
        assert.deepEqual(
          res.status, 200,
          res.body.stockData[0].stock, "GOLD",
          res.body.stockData[0].price,
          res.body.stockData[0].rel_likes,
          res.body.stockData[1].stock, "TWIT",
          res.body.stockData[1].price,
          res.body.stockData[1].rel_likes
        );
        done();
      });
    });
  }); 
});

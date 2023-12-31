const {Bids} = require("../models/Bids.js");
const {Auction} = require("../models/Auction.js");
const User = require('../models/User');

const currency = require("../config/settings");

//Define all Bid APIs or Functions

//require dayjs (after installing)
const dayjs = require("dayjs");
var utc = require('dayjs/plugin/utc')
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);
dayjs.extend(utc);

//List All bids
exports.bid_index_get = (req, res) => {
  res.locals.currency = currency;
  Bids.find().populate('auction').populate('user')
    .then((bids) => {
      //console.log("Bids", bids)
      res.render("bid/index", { bids, dayjs, title: "Show All Bids" });
    })
    .catch((error) => {
      console.log("There was an error: " + error);
      res.send("Cannot Show All Bids. Please try again later.");
    });
};

//Create Bid Operation for Admin User
exports.bid_add_get = (req, res) => {
  res.locals.currency = currency;
  res.render("bid/add", { title: "Create a New Bid" });
};

//Create Bid Operation for Normal User
exports.bidder_add_get = (req, res) => {
  res.locals.currency = currency;
//A user bids so look for the right auction
if((req.query.id)){

  Auction.findById(req.query.id).populate('category').populate('user')
    .then((auction) => {
      //console.log(auction);

      if(auction._id){
        //auctionID = req.query.id;
      res.render("bid/new", { auction, dayjs, title: "Create a New Bid " });
      }else{
        res.send("Auction does not exist."); 
      }
    })
    .catch((error) => {
        console.log("There was an error: " + error);
        res.send("Auction does not exist. Please try another.");
    })

  }else{
    //if there is no auction id present return user to main market
    res.redirect("/main")
;  }

};

exports.bid_create_post = (req, res) => {
  res.locals.currency = currency;
  let bid = new Bids(req.body);
  bid.user = req.user._id;
  bid.auction = req.body.auctionID;
  

  bid.save()
  .then((newBid) => {

  //find the user
  User.findById(req.user._id)
  .then((user) => { 
    user.bids.push(newBid);
    user.save()
    .then(() => {

      Auction.findById(req.body.auctionID)
      .then((auction) => {

          //if bid is higher than auction.highest_bid then update

          if(auction.highest_bid < newBid.amount){
            auction.highest_bid = newBid.amount;

          }

          //check return the value of the bid
          //console.log(newBid);

      auction.bids.push(newBid);
      auction.save()
      .then(() => {
        res.redirect("/bid/index");
      })
      .catch((error) => {
        console.log("Error: " + error);
        res.send("Please try again later!" + error);
      })
    })

    })
    .catch((error) => {
      console.log("Error: " + error);
      res.send("Please try again later!" + error);
    })
    .catch((error) => {
      console.log("Error: " + error);
      res.send("Please try again later!" + error);
    })


  })
  .catch((error) => {
    console.log("Error: " + error); 
    //res.send("Please try again later!" + error); //server crashed HTTP SENT ERROR
  })

  })
};

exports.bid_delete_post = (req, res) => {
  
  console.log("Deleting Bid with ID: " + req.query.id);
  Bids.findByIdAndDelete(req.query.id)
    .then(() => {
      res.redirect("/bid/index");
    })
    .catch((error) => {
      console.log("There was an error deleting: " + error);
      res.send("Cannot Delete Bid. Please try again later.");
    });
};

exports.bid_edit_get = (req, res) => {
  res.locals.currency = currency;
  Bids.findById(req.query.id).populate('auction').populate('user')
    .then((bid) => {

      Auction.findById(bid.auction._id).populate('user')
      .then((auction) => {
        let whoOwns = auction.user.name;
        
        //console.log(whoOwns);
        res.render("bid/edit", { bid, dayjs, whoOwns, title: "Edit your Bid" });

      })
      .catch((err) => {
        console.log(err);
      })

      
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.bid_update_post = (req, res) => {
  res.locals.currency = currency;
  //console.log(req.body.BidID);
  Bids.findByIdAndUpdate(req.body.BidID, req.body)
    .then(() => {

      Auction.findById(req.body.auctionID)
      .then((auction) => {

      if(auction.highest_bid < newBid.amount){
        auction.highest_bid = newBid.amount;
      }

      auction.bids.push(newBid);
      auction.save()
      .then(() => {
        res.redirect("/bid/index");
      })
      .catch((error) => {
        console.log("Error: " + error);
        res.send("Please try again later!" + error);
      })
    })

    })
    .catch((err) => {
      console.log(err);
    });
};

//List bids for specific user - WEAAM
//exports.user_bid_get = (req, res) => {
  //res.render("bid/userbids");
  // Bids.find()
  //   .then((bids) => {
  //     // res.render("bid/userBids", { bids, dayjs, title: "Show Users Bids" });
  //   })
  //   .catch((error) => {
  //     console.log("There was an error: " + error);
  //     res.send("Cannot Show All Bids. Please try again later.");
  //   });
//};

exports.bid_show_get = (req, res) => {
  res.locals.currency = currency;
  //console.log(req.query.id);
  Bids.findById(req.query.id)
  .then((bid) => {
    res.render("bid/detail", {bid, dayjs})
  })
  .catch((err) => {
    console.log(err);
  })
}
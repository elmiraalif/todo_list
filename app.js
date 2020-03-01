//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');


const app = express();
//mongoose connection string
mongoose.connect('mongodb+srv://admin-elmira:3152privacy7001@cluster0-phga0.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//Create the task schema
const itemSchema ={
  name: String
};
//make the model based on the schema
const Item = mongoose.model("Item", itemSchema);

//create a new document
const item1 = new Item({
  name: "Do the laundry"
});
const item2 = new Item({
  name: "Complete the web dev bootcamp"
});
const item3 = new Item({
  name: "Reading IELTS test"
});

// Item.insertMany([item1, item2, item3], function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Added to the db");
//   }
// });
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res){
  //
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Added to the DB");
        }
        });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });
});//end of get method

// A dynamic route -> localhost:3000/?
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show an existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



  // if(List.findOne())
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    //goes back to the get method of /
    res.redirect("/");
  }else{
    //find the targeted list
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
        //add the item to the found list
        foundList.items.push(item);
        //add to the db
        foundList.save();
        //redirect to the specified route
        res.redirect("/" + listName);
      }else{
        console.log("error!");
      }
    });
  }



});//end of post method



app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === 'Today'){
    Item.findOneAndRemove({_id: checkedItemId}, function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Successfully removed from the DB");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }else{
        console.log(err);
      }
    });
  }
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully.");
});

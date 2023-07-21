//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Pratik:P222peanut@cluster0.ep5xw1e.mongodb.net/todolistDB");


const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);


const Item1 = new Item({
  name:"Eat"
});

const Item2 = new Item({
  name:"Brush"
});

const Item3 = new Item({
  name:"Sleep"
});


const defaultItems=[Item1,Item2,Item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find() 
  .then(function(foundItems) {
    if(foundItems.length === 0){
Item.insertMany(defaultItems) 
.then (function(){
    console.log("Successfully added to DB");
})
.catch(function(err){
  console.log(err);
});
res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })
  .catch(function(err){
    console.log(err);
  });

});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

List.findOne({name: customListName})
.then(function(foundList){
  if(!foundList){
    //Creating new list
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    list.save();
    res.redirect("/"+customListName);
  }else{
    
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});

  }
});



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });


  if(listName === "Today"){
  item.save();
  res.redirect("/");  
  }else{
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete", function(req,res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
    console.log("Deleted checked item.");
    res.redirect("/");
});
}else{
    List.findOneAndUpdate({name: listName}, {$pull:{items: {_id: checkedItemId}}})
    .then (function(foundList){
      res.redirect("/" + listName);
    });
}


});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

var    Site   = require ("./models/sites"),
   mongoose = require("mongoose"),
    Comment = require("./models/comments");
var data   = [
          {
            name : "jaipur",
            image :"https://cdn.pixabay.com/photo/2017/12/09/18/18/germany-3008357__340.jpg",
            body  : "blah blah blah",
           },
          {
            name :"lakecity",
            image :"https://cdn.pixabay.com/photo/2017/06/22/11/54/town-2430571__340.jpg",
            body  : "blah blah blah"
          }
        ];


function SeedDB(){
    Site.remove({},function(error){
          if (error)
          {
          console.log(error);
          }
          console.log("site removed");
            data.forEach(function(site){
                  Site.create(site,function(error,createdsite){
                     if (error) {
                         console.log(error);
                        }
                    else {
                      console.log("successfully created a site");
                    //comment created
                    Comment.create(
                          {
                            text:"amazing place to live ",
                            author:"google",
                          },function(error,comment){
                                  if (error) {
                                    console.log(error);
                                  }
                                  else {
                                      createdsite.comments.push(comment);
                                      createdsite.save();
                                      console.log("comment added to user");
                                        }
                                     });
                                  }
                                }
                              );
                          });
                         }
                       )};

module.exports   = SeedDB;


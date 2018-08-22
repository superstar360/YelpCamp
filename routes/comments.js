var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");

// ==================
// COMMENTS ROUTES
// ==================

router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

router.post("/", middleware.isLoggedIn, function(req, res){
    // look up the campground by id
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // creat new comments
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                } else {
                    //Add username and comments to id
                    comment.author.id       = req.user._id; // you had req.user_id instead of req.user._id here
                    comment.author.username = req.user.username;
                    // save comments
                    comment.save();
                    // connect new comments to campgrounds
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "You have added a comment!");
                    // redirect to the campground show page
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

// EDIT COMMENTS ROUTES
//=======================================
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
        }
    });
    
});

// UPDATE COMMENT ROUTE
//=======================================
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if(err){
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

// DESTROY COMMENT ROUTE
//=======================================
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    //findByIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            res.redirect("back");
        } else {
            req.flash("success", "comment deleted!");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    
});


module.exports = router;
Router.configure({
  layoutTemplate: 'layout1'
});

Router.route('/image/next', function () {
  console.log("Redirect!");
	var image = Images.findOne({viewed: {$ne: Meteor.connection._lastSessionId}});
	if(image)
		this.redirect("image", {imageId: image._id});
	else
		this.redirect("/");
}, {
	name: "next"
});

Router.route('/image/:imageId', function () {
		console.log('image route', this.params.imageId);
		this.render('spottingMap');
}, {
	name: 'image'
});

Router.route('/thanks', function () {
		this.render("thanks");
}, {
	name: 'thanks'
});

Router.route('/', function () {
		this.render("donate");
}, {
	name: 'home',
});

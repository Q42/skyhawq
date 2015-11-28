Router.route('/image/next', function () {
  console.log("Redirect!");
	var image = Images.findOne({viewed: {$ne: Meteor.connection._lastSessionId}});
	if(image)
		this.go("image", {imageId: image._id});
	else
		this.go("/");
}, {
	name: "next"
});

Router.route('/image/:imageId', function () {
		console.log(FlowRouter.getParam("imageId"));
		BlazeLayout.render('layout1', {main: "spottingMap"});
}, {
	name: 'image'
});

Router.route('/thanks', function () {
		BlazeLayout.render('layout1', {main: "thanks"});
}, {
	name: 'thanks'
});

Router.route('/', function () {
		BlazeLayout.render('layout1', {main: "donate"});
}, {
	name: 'home',
});

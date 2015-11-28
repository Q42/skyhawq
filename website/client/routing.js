FlowRouter.route('/image/next', {
    name: 'next',
    action: function () {
        var image = Images.findOne({viewed: {$ne: Meteor.connection._lastSessionId}}),
            path = FlowRouter.path("image", {imageId: image._id}, {});
        FlowRouter.go(path);
    }
});

FlowRouter.route('/image/:imageId', {
    name: 'image',
    action: function () {
        BlazeLayout.render('layout1', {main: "spottingMap"});
    }
});

FlowRouter.route('/thanks', {
    name: 'thanks',
    action: function () {
        BlazeLayout.render('layout1', {main: "thanks"});
    }
});

FlowRouter.route('/', {
    name: 'home',
    action: function () {
        BlazeLayout.render('layout1', {main: "donate"});
    }
});

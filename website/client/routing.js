FlowRouter.route('/image/:imageId', {
  action: function() {
    BlazeLayout.render('layout1', {  main: "spottingMap"  });
  }
});

FlowRouter.route('/', {
  action: function() {
    BlazeLayout.render('layout1', {  main: "donate"  });
  }
});
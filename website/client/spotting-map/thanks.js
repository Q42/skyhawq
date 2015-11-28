Template.thanks.helpers({
  'saved': function () {
    var editedMarkers = Session.get('addedMarkers');
    var counts = ["no", "a", "two", "three", "four", "five"];

    var lines = _.chain(editedMarkers).countBy('description').pairs().value().map(function (item) {
      var prefix = counts[item[1]];
						if (item[1] == 1 && /^(a|o|u|i|e)/.test(item[0].toLowerCase()))
        prefix = "an";
						return prefix + " " + (item[1] == 1 ? item[0] : item[0].trim() + "s");
    });
    var last = lines.pop();
    var line = lines.length > 0 ? lines.join(", ") + " and " + last : last;
    return line;
  }
});

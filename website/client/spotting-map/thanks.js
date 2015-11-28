Template.thanks.helpers({
    'saved': function () {
        var editedMarkers = Session.get('addedMarkers');
        var counts = ["no", "a", "two", "three", "four", "five"];

        var lines = _.chain(editedMarkers).countBy('description').pairs().value().map(function (item) {
            return counts[item[1]] + " " + (item[1] == 1 ? item[0] : item[0] + "s");
        });
        var last = lines.pop();
        var line = lines.length > 0 ? lines.join(", ") + " and " + last : last;
        return line;
    }
});

Template.donate.helpers({
    tagCount: function () {
        var tagLists = Images.find()
            .map(img => (img.markers || []).filter(marker => marker.type == 'orangutan'));

        return tagLists.reduce((acc, tagList) => acc + tagList.length, 0);
    }
});

Images = new Mongo.Collection('images');

var basePath = 'http://greenpeace.hermanbanken.nl/flights/',
    flightId = '2',
    skip = 290;

if (Meteor.isServer && Images.find({flightId: flightId}).count() === 0) {
    HTTP.get(basePath + flightId + '/' + 'files.json', {}, function (error, result) {
        var data = JSON.parse(result.content);

        // import photos
        data.photos.forEach(function (photo, index) {
            if (index > skip) {
                Images.insert({
                    'flightId': flightId,
                    'source': basePath + flightId + '/' + photo.photoPath,
                    'date': photo.date,
                    'coords': {
                        // 'lat': photo.gps.latitude,
                        // 'lng': photo.gps.longitude
                    },
                    'markers': []
                });
            }
        });
    });
}

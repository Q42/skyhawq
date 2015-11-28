Images = new Mongo.Collection('images');

var basePath = 'http://greenpeace.hermanbanken.nl/flights/',
    flightId = '1';

if (Meteor.isServer && Images.find({flightId: flightId}).count() === 0) {
    HTTP.get(basePath + flightId + '/' + 'path', {}, function (error, result) {
        var data = result.data;

        // import photos
        data.photos.forEach(function (photo) {
            Images.insert({
                'flightId': flightId,
                'source': basePath + flightId + '/' + photo.photoPath,
                'date': photo.date,
                'coords': {
                    'lat': photo.gps.latitude,
                    'lng': photo.gps.longitude
                },
                'markers': []
            });
        });
    });
}

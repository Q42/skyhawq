Images = new Mongo.Collection('images');
Flights = new Mongo.Collection('flights');

var basePath = 'http://greenpeace.hermanbanken.nl/flights/',
    flightId = '2';

if (Meteor.isServer && Images.find({flightId: flightId+"v2"}).count() === 0) {
    HTTP.get(basePath + flightId + '/' + 'path', {}, function (error, result) {
        var data = result.data;

        // Import path
        Flights.insert({
          flightId: flightId,
          path: data.flightPath
        });

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

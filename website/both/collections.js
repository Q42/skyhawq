Images = new Mongo.Collection('images');

if (Meteor.isServer && Images.find().count() === 0) {
    Images.insert({
        'source': '/data/sumatra.png',
        'coords': {
            'lat': 1234,
            'lng': 1234
        },
        'markers': [
            {
                'type': 'ape',
                'description': 'a monkey in a tree',
                'x': 100,
                'y': 123
            }
        ]
    });
}

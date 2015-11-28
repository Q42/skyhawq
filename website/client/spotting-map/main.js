Template.layout1.onRendered(function(){
  console.log("Main");
  var map = L.map('map', { maxZoom: 17 }).setView([51.505, -0.09], 13);
  // create the tile layer with correct attribution
  var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  var osmAttrib='Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
  var osm = new L.TileLayer(osmUrl, {minZoom: 8, maxZoom: 12, attribution: osmAttrib});		

  // start the map in South-East England
  map.setView(new L.LatLng(51.3, 0.7),15);
  map.addLayer(osm);
  
  var layers = [];
  Tracker.autorun(function(){
    Flights.find().fetch().forEach(function(flight){
      var points = flight.path.map(p => ({
        lat: p.latitude,
        lng: p.longitude,
        date: new Date(p.date)
      }));
      
      var markers = points.map((p,i) => {
        var point = new L.LatLng(p.lat,p.lng, true);
        if(i == 0)
          map.setView(point, 16);
        return point;
      })
      
      var line = new L.Polyline(markers, {
        color: 'green',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
      });
      layers.forEach(layer => map.removeLayer(layer));
      layers.push(line);
      map.addLayer(line);
    })
  })
});
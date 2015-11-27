var lazy = require("lazy"), fs  = require("fs");
var moment = require("moment");

var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
  , day = beforeOneWeek.getDay()
  , diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
  , lastMonday = new Date.UTC(beforeOneWeek.setUTCDate(diffToMonday))
  , lastSundayWithTime = new Date.UTC(beforeOneWeek.setUTCDate(diffToMonday + 6))
  , lastSunday = new Date.UTC(lastSundayWithTime.getUTCFullYear(), lastSundayWithTime.getUTCMonth(), lastSundayWithTime.getUTCDate());

var data = fs.readFileSync('/Volumes/Crucial/latest/gps-20151127-195319.txt').toString()
     .split('\n')
     .map(function(line) {
         
 		var parts = line.toString().split('=');

 		if(parts.length != 2) {
 			return;
 		}

		var partType = parts[0];
		var partData = parts[1];

		if(partType == 'gps') {
			var gpsData = partData.split(';');

			var currentDate = parseDateTimeFromGpsWeekTime(parseFloat(gpsData[0]));			

			return {
				type: 'gps',
				datetime: currentDate,
				longitude: gpsData[1],
				latitude: gpsData[2],
				raw: gpsData
			};
		} else if(partType == 'status') {
			return {
				type: partType,
				data: partData
			};
		}
     })
     .filter(function(line) {
     	return line !== undefined;
     })
     .reduce(function (state, current) {
     	if(current.type == 'status')
     		state.fix = current.data;
     	else {
     		if(state.fix != null && state.fix != "nofix"){
     			state.store.push(current)
     		}
     	}
     	return state;
     }, { fix: null, store: [] });

data.store.forEach(function(line) { 
	console.log(line)
});

var fotos = fs.readdirSync("/Volumes/Crucial/latest/").filter(function(f) {
	return f.indexOf(".jpg") >= 0;
}).map(function(f){
	return {
		date: moment(f.substr(0, 13), "YYMMDD-HHmmss").toDate(),
		path: f
	}
});

function interpolate(a, b, t) {
	t = (t - a.datetime) / (b.datetime - a.datetime);
	var dx = b.longitude - a.longitude,
		dy = b.latitude - a.latitude;
	return {
		longitude: dx * t + a.longitude,
		latitude: dy * t + a.latitude
	};
}

var i = 0, j = 0, results = [];
while(i < data.length && j < fotos.length) {
	// Foto before GPS (before fix)
	if(fotos[j].date < data[i].datetime) {
		j++;
		continue;
	}
	// Foto is after next GPS
	if(data.length > i+1 && fotos[j].date > data[i+1].datetime) {
		i++;
		continue;
	}
	// Foto between GPSs
	results.push({
		photoPath: fotos[j].path,
		datetime: fotos[j].date,
		gps: interpolate(data[i], data[i+1], fotos[j].date)
	})
}

console.log(results);

function parseDateTimeFromGpsWeekTime(gpsWeekTime) {
	return new Date(lastSunday.getTime() + gpsWeekTime*1000);
}
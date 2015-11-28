var lazy = require("lazy"), fs = require("fs");
var moment = require("moment");

var startOfWeek = moment().utc().startOf('week');

function Parse(gpsFile, photoDir) {

	var gps = fs.readFileSync(gpsFile).toString()
		.split('\n')
		.map(function (line) {
			var parts = line.toString().split('=');
			if (parts.length != 2) {
				return;
			}
			var partType = parts[0];
			var partData = parts[1];

			if (partType == 'gps') {
				var gpsData = partData.split(';');
				return {
					type: 'gps',
					date: parseDateFromGpsWeekTime(parseFloat(gpsData[0])),
					longitude: parseFloat(gpsData[1]),
					latitude: parseFloat(gpsData[2]),
					raw: gpsData
				};
			} else if (partType == 'status') {
				return {
					type: partType,
					data: partData
				};
			}
		})
		.filter(function (line) {
			return line !== undefined;
		})
		.reduce(function (state, current) {
			if (current.type == 'status')
				state.fix = current.data;
			else {
				if (state.fix != null && state.fix != "nofix") {
					state.store.push(current)
				}
			}
			return state;
		}, { fix: null, store: [] }).store;

	var fotos = fs.readdirSync(photoDir).filter(function (f) {
		return f.indexOf(".jpg") >= 0;
	}).map(function (f) {
		return {
			date: moment.utc(f.substr(0, 13), "YYMMDD-HHmmss"),
			path: f
		}
	});

	function interpolate(a, b, t) {
		t = t.diff(a.date) / b.date.diff(a.date);
		var dx = b.longitude - a.longitude,
			dy = b.latitude - a.latitude;
		return {
			longitude: dx * t + a.longitude,
			latitude: dy * t + a.latitude,
		};
	}

	var i = 0, j = 0, results = [];
	while (i < gps.length && j < fotos.length) {
		// Foto before GPS A (before fix)
		if (fotos[j].date.isBefore(gps[i].date)) {
			j++;
			continue;
		}
		// Foto between GPS A&B
		if (gps.length > i + 1 && fotos[j].date.isBefore(gps[i + 1].date)) {
			results.push({
				photoPath: fotos[j].path,
				date: fotos[j].date.toDate(),
				gps: interpolate(gps[i], gps[i + 1], fotos[j].date)
			});
			j++;
		}
		// Foto is after next GPS B
		i++;
	}

	return {
		flightPath: gps,
		photos: results
	};

}

function parseDateFromGpsWeekTime(gpsWeekTime) {
	return startOfWeek.clone().add(gpsWeekTime, 'seconds');
}

module.exports = {
	Parse: Parse
}
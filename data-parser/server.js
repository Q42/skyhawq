var http = require('http'),
    path = require('path'),
    os = require('os'),
    fs = require('fs'),
		url = require('url'),
		Parse = require('./parse').Parse;

var Busboy = require('busboy');
var md5File = require('md5-file');
var childProcess = require("child_process");
var io = null; // Socket.io will be put here

// Configuration: start like this `SECRET=random DATA=/folder node server.js`
var secret = process.env.SECRET || "secret";
var folder = process.env.DATA   || "/Volumes/Crucial/upload";
var port   = process.env.PORT   || 8000;

childProcess.execSync("mkdir -p "+folder);

var methods = {
	
	index: function(req, res){
		res.writeHead(200, {'Content-Type': 'text/html' });
		res.end("Greanpeace data ingestion server<br><br>See <a href='/flights'>/flights</a>");
		return;
	},
	
	list: function(req, res) {
		var folders = fs.readdirSync(folder);
		res.writeHead(200, {'Content-Type': 'application/json' });
		return json(res, folders.filter(noDotFiles).map(function(f){
			var stat = fs.statSync(path.join(folder, f));
			return {
				id: f,
				created: stat.ctime
			}
		}).sort(function(a, b) {
			return b.created - a.created;
		}));
	},
	
	flight: function(req, res, flightId) {
		var p = path.join(folder, flightId);
		if(!/^[a-z0-9\-]+$/.test(flightId) || !saveStat(p) || !saveStat(p).isDirectory()) {
			return json(res, {
				"error": "Invalid flight name"
			}, 400);
		}
		
		var files = fs.readdirSync(p);
		var fileStats = files.filter(noDotFiles).map(function(f){
			var stat = fs.statSync(path.join(folder, flightId, f));
			return {
				id: f,
				created: stat.ctime
			}
		});
		json(res, {
			lastModified: fileStats.sort(function(a,b){ return a.created -  b.created; }).last(),
			files: fileStats
		});
		flightId
		return;
	},
	
	serveFile: function(req, res, filename) {
		if(filename.indexOf("..") >= 0) {
			return res.end();
		}
    var file = path.join(folder, filename);
		if(!saveStat(file) || !saveStat(file).isFile()) {
			console.log("not exists: " + file);
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('404 Not Found\n');
			res.end();
		}
		var mimeType = mimeTypes[path.extname(file).split(".")[1]];
		res.writeHead(200, mimeType);
		var fileStream = fs.createReadStream(file);
		fileStream.pipe(res);
	},
	
	upload: function(req, res, flightId) {
		if(!req.headers['secret'] || req.headers['secret'] !== secret) {
			console.log("Unauthorized upload try");
      res.writeHead(401, { 'Connection': 'close' });
      res.end("Unauthorized");			
		}
		
		var busboy = new Busboy({ headers: req.headers });
		var hashes = [], files = [];
		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			childProcess.execSync("mkdir -p "+path.join(folder, flightId));
      var saveTo = path.join(folder, flightId, path.basename(fieldname));
			var mimeType = mimeTypes[path.extname(fieldname).split(".")[1]];
      file.pipe(fs.createWriteStream(saveTo));
			file.on('end',function(){
				files.push("/flights/" + flightId + "/" + path.basename(fieldname));
				hashes.push(md5File(saveTo));
			});
    });
    busboy.on('finish', function() {
      res.writeHead(200, { 'Connection': 'close' });
      res.end(hashes.join(","));
			notifyChanged(flightId, files);
    });
    return req.pipe(busboy);
	},
	
	serveFlightPath(req, res, flightId) {
		var gps = path.join(folder, flightId, "gps.txt");
		var dir = path.join(folder, flightId);
		if(saveStat(gps)) {
			var flight = Parse(gps, dir);
			json(res, flight);
		} else {
      res.writeHead(404, { 'Connection': 'close' });
      res.end("Not yet available. Wait for gps.txt to be uploaded.");
		}
	}
}

function saveStat(file) {
	try {
		var stat = fs.statSync(file);
		return stat;
	} catch (e) {
		return false;
	}
}

function notifyChanged(flightId, files) {
	// Notify Mongo here
	console.log("Good time to notify mongo db");
	io.emit({
		flight: flightId,
		files: files
	}, { for: 'everyone' });
}

var server = http.createServer(function(req, res) {
	try {
		// View
		if (req.method === 'GET') {
			if (req.url == "/flights") {
				return methods.list(req, res);
			}
			if(req.url.indexOf("/flights/") == 0 && req.url.length > "/flights/".length) {
				var id = req.url.substr("/flights/".length);
				if(id.indexOf("/") > 0) {
					if(id.split("/")[1] == 'path') {
						return methods.serveFlightPath(req, res, id.split("/")[0]);
					}
					return methods.serveFile(req, res, req.url.substr("/flights/".length));
				}
				return methods.flight(req, res, id);
			}
			return methods.index(req, res);
		}
		
		// Upload
		if (req.method === 'POST' && req.url.indexOf("/upload/") == 0) {
			var id = req.url.substr("/upload/".length);
			return methods.upload(req, res, id);
		}
		
		// 404
		res.writeHead(404);
		res.end();
	} catch(e) {
		console.error(e);
	  res.writeHead(500);
  	res.end("Internal Server Error");
	}
});

io = require('socket.io')(server);
io.on('connection', function(socket){
	console.log("User connected");
})

server.listen(port, function() {
  console.log('Listening for requests');
});

function noDotFiles(f){
	return f[0] != '.';
}

Array.prototype.last = function(){
	return this[this.length - 1];
}

var mimeTypes = {
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
		"txt": "text/plain",
		"csv": "text/plain",
};

function json(res, data, status) {
	res.writeHead(status || 200, {'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}
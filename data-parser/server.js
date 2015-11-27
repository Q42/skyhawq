var http = require('http'),
    path = require('path'),
    os = require('os'),
    fs = require('fs');

var Busboy = require('busboy');
var md5File = require('md5-file');
var childProcess = require("child_process");

// Configuration: start like this `SECRET=random DATA=/folder node server.js`
var secret = process.env.SECRET || "secret";
var folder = process.env.DATA   || "/Volumes/Crucial/upload";

childProcess.execSync("mkdir -p "+folder);

function json(res, data) {
	res.writeHead(200, {'Content-Type': 'application/json' });
	res.end(JSON.stringify(data));
}

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
		if(!/^[a-z]+$/.test(flightId)) {
			return json(res, {
				"error": "Invalid flight name"
			});
		}
		var files = fs.readdirSync(path.join(folder, flightId));
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
	
	upload: function(req, res, flightId) {
		if(!req.headers['secret'] || req.headers['secret'] !== secret) {
			console.log("Unauthorized upload try");
      res.writeHead(401, { 'Connection': 'close' });
      res.end("Unauthorized");			
		}
		
		var busboy = new Busboy({ headers: req.headers });
		var files = [];
		busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			childProcess.execSync("mkdir -p "+path.join(folder, flightId));
      var saveTo = path.join(folder, flightId, path.basename(fieldname));
      file.pipe(fs.createWriteStream(saveTo));
			file.on('end',function(){
				files.push(md5File(saveTo));
			});
    });
    busboy.on('finish', function() {
      res.writeHead(200, { 'Connection': 'close' });
      res.end(files.join(","));
    });
    return req.pipe(busboy);
	}
	
}

http.createServer(function(req, res) {
	
	// View
	if (req.method === 'GET') {
		if (req.url == "/flights") {
			return methods.list(req, res);
		}
		if(req.url.indexOf("/flights/") == 0 && req.url.length > "/flights/".length) {
			var id = req.url.substr("/flights/".length);
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
}).listen(8000, function() {
  console.log('Listening for requests');
});

function noDotFiles(f){
	return f[0] != '.';
}

Array.prototype.last = function(){
	return this[this.length - 1];
}
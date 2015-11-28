# Data Server

Node server. Start with environment variables `DATA`, `SECRET` and `PORT`:

- `DATA`: data directory, where to store photos
- `SECRET`: secure key, do not commit, only owners of this secret may upload
- `PORT`: change port, default 8000

Endpoints:

- `/flights` : available flights
- `/flights/[name]` : files in this flight 
- `/flights/[name]/path` : flight path of this flight, fully JSON parsed and photos with interpolated GPS location
- `/socket.io/socket.io.js` : Socket.io client file. Receive websocket push updates when new files are uploaded. 

Websocket packet structure:

	```{
		"flight": "flight-id-maybe-with-date",
		"files": ["/filename-relative-to-hostname.jpg"]
	}```
	
where `files` are the updated files. Most of the time files will be uploaded one by one.
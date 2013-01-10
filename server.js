var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    app = http.createServer(requestHandler),
    io = require('socket.io').listen(app),
    players = {},
    mimeTypes = {
        "html": "text/html",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "png": "image/png",
        "js": "text/javascript",
        "css": "text/css"};

function requestHandler(req, res) {
    var uri = url.parse(req.url).pathname;
    if(uri == '/'){
        uri = '/index.html'
    }
    var filename = path.join(process.cwd(), uri);
    path.exists(filename, function(exists) {
        if(!exists) {
            console.log("not exists: " + filename);
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            res.end();
            return;
        }
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, mimeType);

        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    });
}

app.listen(3000, '127.0.0.1');

io.sockets.on('connection', function (socket) {
    socket.emit('existingusers', { players: players })
    players[socket.id] = newplayer = { id: socket.id, name: 'Guest' };
    socket.broadcast.emit('newuser', { player: newplayer });

    socket.on('mousemove', function(data){
        data.player = socket.id;
        socket.broadcast.emit('playerpositions', data);
    });

    socket.on('disconnect', function(){
        var player = players[socket.id];
        socket.broadcast.emit('playerleft', { player: player });
        delete players[player.id];
    });
});

console.log('Running server')
var http = require('http'),
    app = http.createServer(requestHandler),
    fs = require('fs'),
    io = require('socket.io').listen(app),
    players = {};

function requestHandler(req, res) {
    fs.readFile(__dirname + '/index.html',function(err, data){
        if(err){
            res.writeHead(500)
            {
                return res.end('Error loading index.html');
            }
        }
        res.writeHead(200);
        res.end(data);
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
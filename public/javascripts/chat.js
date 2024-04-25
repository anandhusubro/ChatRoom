// Define the Chat constructor function
var Chat = function(socket) {
    this.socket = socket;
};

// Define the sendMessage method on the Chat prototype
Chat.prototype.sendMessage = function(room, text) {
    var message = {
        room: room,
        text: text
    };
    this.socket.emit('message', message);
};

// Define the changeRoom method on the Chat prototype
Chat.prototype.changeRoom = function(room) {
    this.socket.emit('join', {
        newRoom: room
    });
};

// Define the processCommand method on the Chat prototype
Chat.prototype.processCommand = function(command) {
    var words = command.split(' ');
    var command = words[0].substring(1).toLowerCase();
    var message = false;
    switch (command) {
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;
        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;
        default:
            message = 'Unrecognized command.';
            break;
    }
    return message;
};
 module.exports=Chat;
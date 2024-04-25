
function divEscapedContentElement(message) {
  var div = document.createElement('div');
  div.textContent = message;
  return div;
}

function divSystemContentElement(message) {
  var div = document.createElement('div');  
  div.innerHTML = '<i>' + message + '</i>';
  return div;
}

function processUserInput(chatApp, _socket) {
    console.log('message is sent')
  var message = document.getElementById('send-message').value;
  var systemMessage;
  if (message.charAt(0) == '/') {
      systemMessage = chatApp.processCommand(message);
      if (systemMessage) {
          document.getElementById('message').appendChild(divSystemContentElement(systemMessage));
      }
  }else 
  {
      chatApp.sendMessage(document.getElementById('rooms').textContent, message);
      document.getElementById('message').appendChild(divEscapedContentElement(message));
      document.getElementById('message').scrollTop = document.getElementById('message').scrollHeight;
  }
  document.getElementById('send-message').value = '';
}

var socket = io.connect();

document.addEventListener('DOMContentLoaded', function() {
  var chatApp = new Chat(socket);

  socket.on('nameResult', function(result) {
      var message;
      if (result.success) {
          message = 'You are now known as ' + result.name + '.';
      }else
      {
          message = result.message;
      }
      document.getElementById('message').appendChild(divSystemContentElement(message));
  });





  socket.on('joinResult', function(result) {
      document.getElementById('rooms').textContent = result.rooms;
      document.getElementById('message').appendChild(divSystemContentElement('Room changed.'));
  });

  socket.on('message', function(message) {
      var newElement = document.createElement('div');
      newElement.textContent = message.text;
      document.getElementById('message').appendChild(newElement);
  });

  socket.on('rooms', function(rooms) {
      var roomsList = document.getElementById('room-list');
      roomsList.innerHTML = '';
      for (var room in rooms) {
          room = room.substring(1, room.length);
          if (room !== '') {
              roomsList.appendChild(divEscapedContentElement(room));
          }
      }
      var roomDivs = roomsList.getElementsByTagName('div');
      for (var i = 0; i < roomDivs.length; i++) {
        roomDivs[i].addEventListener('click', () => {
            chatApp.processCommand('/join' + this.textContent);
            document.getElementById('send-message').focus();
        });
    }
    
  });

  setInterval(function() {
      socket.emit('rooms');
  }, 3000);

  
  document.querySelector('#send-message').focus();

  document.getElementById('send-form').addEventListener('submit', function(event) {
      event.preventDefault();
      processUserInput(chatApp, socket);
  });
});

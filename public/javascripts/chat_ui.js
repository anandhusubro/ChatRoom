function divEscapedContentElement(message) {
    return document.createElement('div').textContent = message;
  }
  
  function divSystemContentElement(message) {
    var div = document.createElement('div');
    div.innerHTML = '<i>' + message + '</i>';
    return div;
  }
  
  function processUserInput(chatApp, socket) {
    var message = document.getElementById('send-message').value;
    var systemMessage;
    if (message.charAt(0) == '/') {
      systemMessage = chatApp.processCommand(message);
      if (systemMessage) {
        document.getElementById('messages').appendChild(divSystemContentElement(systemMessage));
      }
    } else {
      chatApp.sendMessage(document.getElementById('room').textContent, message);
      document.getElementById('messages').appendChild(divEscapedContentElement(message));
      document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
    }
    document.getElementById('send-message').value = '';
  }
  
  var socket = io.connect();
  
  document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new Chat(socket);
  
    socket.on('nameResult', (result) => {
      const message = result.success ? `You are now known as ${result.name}.` : result.message;
      document.getElementById('messages').appendChild(divSystemContentElement(message));
    });
  });
  
    socket.on('joinResult', function(result) {
      document.getElementById('room').textContent = result.room;
      document.getElementById('messages').appendChild(divSystemContentElement('Room changed.'));
    });
  
    socket.on('message', function(message) {
      var newElement = document.createElement('div');
      newElement.textContent = message.text;
      document.getElementById('messages').appendChild(newElement);
    });
  
    socket.on('rooms', function(rooms) {
      var roomListElement = document.getElementById('room-list');
      roomListElement.innerHTML = '';
      for (var room in rooms) {
        room = room.substring(1, room.length);
        if (room != '') {
          roomListElement.appendChild(divEscapedContentElement(room));
        }
      }
      var roomListDivs = roomListElement.getElementsByTagName('div');
      for (var i = 0; i < roomListDivs.length; i++) {
        roomListDivs[i].addEventListener('click', function() {
          chatApp.processCommand('/join ' + this.textContent);
          document.getElementById('send-message').focus();
        });
      }
    });
  
    setInterval(function() {
      socket.emit('rooms');
    }, 1000);
  
    document.getElementById('send-message').focus();
  
    document.getElementById('send-form').addEventListener('submit', function(event) {
      event.preventDefault();
      processUserInput(chatApp, socket);
    });

  
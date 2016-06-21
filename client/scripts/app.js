
/* JSON structure:
Object {results: Array[100]}
results: Array[100]
0: Object
createdAt: "2016-06-20T22:05:08.944Z"
objectId:"etyCd0boFz"
roomname:"all"
text:"trololol"
updatedAt:"2016-06-20T22:05:08.944Z"
username:"HIR"
*/
(function() {
  $(document).ready( function() {
    // === APPEND AND REFRESH FUNCTIONS === //
    var initialRoomStateSet = false;
    var roomState = null;
    var roomOptions;
    var friends = [];

    var setOptions = function(array) {
      $('.roomOptions option:gt(0)').remove();

      _.each(array, function(location) {
        $option = $('<option class="roomOption"></option>').attr('value', location).text(location);
        $('.roomOptions').append($option);
      });
    };

    var addHandlers = function() {
      $('.roomOptions').on('change', function() {
        // console.log(this);
        if ($('select option:selected')[0].innerHTML === 'Home:All') {
          roomState = null;
          // console.log(roomState, $('select option:selected')[0].innerHTML); 
        } else {
          roomState = $('select option:selected')[0].innerHTML;
          // console.log(roomState, $('select option:selected')[0].innerHTML); 
        }
      });
    };

    var setRoomState = function(HTML) {
      roomState = HTML;
      console.log(roomState);
    };

    var appendChats = function (messages) {
      if (!initialRoomStateSet) {
        roomOptions = _.filter(
                    _.uniq(
                    _.pluck(messages.results, 'roomname')), function(location) {
                      return location != undefined && location.length > 0; })
                    .sort();
        setOptions(roomOptions);
        addHandlers();
        initialRoomStateSet = true;
      }
      if (!roomState) {
        _.each(messages.results, function(message) {
          $message = $('<li class="chat"></li>');
          $user = $('<div class="username"></div>');
          $text = $('<div class="messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $user.text('user: ' + message.username);
          if (_.indexOf(friends, $user[0].innerHTML.slice(6)) !== -1) {
            $text.addClass('friendMessage');
          }
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $('#chats').append($message);
        });
      } else {
        var messagesToUse = _.filter(messages.results, function(message) {
          return message.roomname === roomState;
        });

        _.each(messagesToUse, function(message) {
          $message = $('<li class="chat"></li> ');
          $user = $('<div class="username"></div>');
          $text = $('<div class="messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $user.text('user: ' + message.username);
          if ( _.indexOf(friends, $user[0].innerHTML.slice(6)) !== -1) {
            $text.addClass('friendMessage');
          }
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $('#chats').append($message);
        });
      }
      // event handler
      $('.username').on('click', function() {
        if (_.indexOf(friends, this.innerHTML.slice(6)) === -1) {
          friends.push(this.innerHTML.slice(6));
        }
        $(this).parent().find('.messageBody').addClass('friendMessage');
      });
    }; 
    
    var refreshChats = function() {
      $('.chat').remove();
      getMessage(appendChats);
    };

    // === AJAX CALLS === // 
    var postMessage = function(message) {
      $.ajax({
        url: 'https://api.parse.com/1/classes/messages',
        type: 'POST',
        data: JSON.stringify(message),
        contentType: 'application/json',
        success: function (data) {
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message', data);
        }
      });
    };
    var getMessage = function(cb) {
      $.ajax({
        url: 'https://api.parse.com/1/classes/messages',
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {
          cb(data);
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message', data);
        }
      });
    };
    // === USER INTERACTION === //
    $('.tweetSubmit').on('click', function() {
      message.username = activeUserName = $('.userNameInput').val();
      message.text = activeUserText = $('.userTextInput').val();
      message.roomname = activeUserRoom = $('.userRoomInput').val();
      initialRoomStateSet = false;
      postMessage(message);
    });
    // === BEFRIEND === // 
    // optional space for special friend functionality.

    // === MESSAGES === // 
    var activeUserName = 'undefined';
    var activeUserText = 'undefined';
    var activeUserRoom = 'undefined';

    var message = {
      username: activeUserName,
      text: activeUserText,
      roomname: 'all'
    };
    // === FUNCTION INVOCATIONS === // 
    getMessage(appendChats);
    // every 10 seconds we refresh chats
    setInterval(refreshChats, 10000);
    // once a minute we enable a refresh of the options in the rooms dropdown.
    setInterval(function() {
      initialRoomStateSet = false;
    }, 60000);
  });
})();

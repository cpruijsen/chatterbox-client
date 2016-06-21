
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
    var favoriteTweets = [];

    var setOptions = function(array) {
      $('.roomOptions option:gt(2)').remove();

      _.each(array, function(location) {
        $option = $('<option class="roomOption"></option>').attr('value', location).text(location);
        $('.roomOptions').append($option);
      });
    };

    var addHandlers = function() {
      $('.roomOptions').on('change', function() {
        if ($('select option:selected')[0].innerHTML === 'Home:All') {
          roomState = null;
        } else {
          roomState = $('select option:selected')[0].innerHTML; 
        }
      });
    };

    // note use != undefined to coerce null as well.
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
      } else if (roomState !== 'Friends' && roomState !== 'Favorites') {
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
      } else if (roomState === 'Friends') {
        // note doesn't work for special characters currently.
        var friendMessages = _.filter(messages.results, function(message) {
          return friends.indexOf(message.username) !== -1;
        });
        _.each(friendMessages, function(message) {
          $message = $('<li class="chat"></li> ');
          $user = $('<div class="username"></div>');
          $text = $('<div class="friendMessage messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $user.text('user: ' + message.username);
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $('#chats').append($message);
        });
      } else { // implemented favorites
        _.each(favoriteTweets, function(message) {
          $message = $('<li class="chat"></li> ');
          $user = $('<div class="username"></div>');
          $text = $('<div class="favoriteMessage messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $user.text('user: ' + message.username);
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $('#chats').append($message);
        });
      }
      $('.username').on('click', function() {
        if (_.indexOf(friends, this.innerHTML.slice(6)) === -1) {
          friends.push(this.innerHTML.slice(6));
        } // note changed to ToggleClass (one click makes friend, another unfriend)
        $(this).parent().find('.messageBody').toggleClass('friendMessage');
      });
      
      $fav = $('<img class="favIcon" src="http://icons.iconarchive.com/icons/iconsmind/outline/128/Thumb-icon.png">');
      $('.chat').append($fav);
      $('.favIcon').on('click', function() {
        var index = favoriteTweets.indexOf($(this).parent()[0].innerHTML);
        if (index === -1) { // add to favorites
          favoriteTweets.push($(this).parent()[0].innerHTML);
        } else { // remove from favorites
          if (index === 0) { // to make sure we can remove if the element is array[0]
            favoriteTweets = favoriteTweets.slice(1);
          } else {
            favoriteTweets = favoriteTweets.slice(index - 1, index).concat(favoriteTweets.slice(index + 1));
          }
        }
      });
      // end of append fn.
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

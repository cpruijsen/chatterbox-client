// objectId: "nopqeVx6an"

(function() {
  $(document).ready( function() {
    // === APPEND AND REFRESH FUNCTIONS === //
    var initialRoomStateSet = false;
    var roomState = null;
    var roomOptions;
    var friends = [];
    var favoriteTweets = [];

    // === FILE || PROFILE PICTURE UPLOAD === // 
    $('[value=\'Upload\']').click(function() {
        
      var formData = new FormData($('.fileForm')[0]);
      var fileURL;
      
      $.ajax({
        url: 'https://api.parse.com/1/files/snowden.jpg',
        type: 'POST',
        contentType: 'image/jpeg',
        data: JSON.stringify(formData),
        success: function(s) {
          fileURL = s; 
          var fileMessage = {
            'name': activeUserName,
            'username': activeUserName,
            'photo': {
              'name': fileURL.name,
              '__type': 'File'
            }
          };
          sendPictureToParse(fileMessage);
          console.log('upload done', fileURL); 
        },
        error: function(e) {
          console.log('error', e); 
        }
      });

      var sendPictureToParse = function(fileObject) {
        $.ajax({
          url: 'https://api.parse.com/1/classes/users',
          type: 'POST',
          xhr: function() { 
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) { 
              myXhr.upload.addEventListener('progress', progressHandlingFunction, false); 
            }
            return myXhr;
          },
          success: function(s) { console.log(s, 'uploaded'); },
          error: function(e) { console.log(e, 'some problems'); },
          data: JSON.stringify(fileObject),
          cache: false,
          contentType: false,
          processData: false
        });
      };
      
    });

    var progressHandlingFunction = function (e) {
      if (e.lengthComputable) {
        $('progress').attr({value: e.loaded, max: e.total });
      }
    };

    var getPictures = function() {
      $.ajax({
        url: 'https://api.parse.com/1/classes/users',
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {
          console.log(data);
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message', data);
        }
      });
    };
    
    // === ROOM and MESSAGE CONTENT STATE === // 
    var setOptions = function(array) {
      $('.roomOption:gt(2)').remove();

      _.each(array, function(location) { // NOTE: materialize CSS does funky things to select. Have to initialize and add a hidden class.
        $option = $('<option class="roomOption hidden"></option>').attr('value', location).text(location);
        $('.roomOptions').append($option);
      });

      $('select:not([multiple]').material_select();

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
          $message = $('<li class="chat collection-item avatar"></li>');
          $user = $('<div class="username"></div>');
          $text = $('<div class="messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $objectId = $('<div class="objectId hidden"></div>');
          $user.text('user: ' + message.username);
          if (_.indexOf(friends, $user[0].innerHTML.slice(6)) !== -1) {
            $text.addClass('friendMessage');
          }
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);
          $objectId.text(message.objectId);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $message.append($objectId);
          $('#chats').append($message);
        });
      } else if (roomState !== 'Friends' && roomState !== 'Favorites') {
        var messagesToUse = _.filter(messages.results, function(message) {
          return message.roomname === roomState;
        });

        _.each(messagesToUse, function(message) {
          $message = $('<li class="chat collection-item avatar"></li> ');
          $user = $('<div class="username"></div>');
          $text = $('<div class="messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $objectId = $('<div class="objectId hidden"></div>');
          $user.text('user: ' + message.username);
          if ( _.indexOf(friends, $user[0].innerHTML.slice(6)) !== -1) {
            $text.addClass('friendMessage');
          }
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);
          $objectId.text(message.objectId);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $message.append($objectId);
          $('#chats').append($message);
        });
      } else if (roomState === 'Friends') {
        // note doesn't work for special characters currently.
        var friendMessages = _.filter(messages.results, function(message) {
          return friends.indexOf(message.username) !== -1;
        });
        _.each(friendMessages, function(message) {
          $message = $('<li class="chat collection-item avatar"></li> ');
          $user = $('<div class="username"></div>');
          $text = $('<div class="friendMessage messageBody"></div>');
          $room = $('<div class="roomName"></div>');
          $objectId = $('<div class="objectId hidden"></div>');
          $user.text('user: ' + message.username);
          $text.text('text: ' + message.text);
          $room.text('room: ' + message.roomname);
          $objectId.text(message.objectId);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $message.append($objectId);
          $('#chats').append($message);
        });
      } else { // implemented favorites
        _.each(favoriteTweets, function(message) {
          $temp = $.parseHTML(message[0]);
          $message = $('<li class="chat"></li>');
          $user = $('<div class="username"></div>');
          $user.text($temp[0].innerHTML);
          $text = $('<div class="favoriteMessage messageBody"></div>');
          $text.text($temp[2].innerHTML);
          $room = $('<div class="roomName"></div>');
          $room.text($temp[1].innerHTML);
          $objectId = $('<div class="objectId hidden"></div>');
          $objectId.text($temp[3].innerHTML);

          $message.append($user);
          $message.append($room);
          $message.append($text);
          $message.append($objectId);
          $('#chats').append($message);
        });
      }
      $('.username').on('click', function() {
        var friendIndex = _.indexOf(friends, this.innerHTML.slice(6));
        if (friendIndex === -1) {
          friends.push(this.innerHTML.slice(6));
        } else {
          // splice friends array to take out friend
          friends.splice(friendIndex, 1);
        } // toggle class on the individual message
        $(this).parent().find('.messageBody').toggleClass('friendMessage');
      });
      
      $fav = $('<img class="favIcon" src="http://icons.iconarchive.com/icons/iconsmind/outline/128/Thumb-icon.png">');
      $('.chat').append($fav);
      $('.favIcon').on('click', function() { // NOTE: v messy currently... (but works...)
        var index = _.flatten(favoriteTweets).indexOf($.parseHTML($(this).parent()[0].innerHTML)[3].innerHTML);
        if (index === -1) { // add to favorites
          favoriteTweets.push([$(this).parent()[0].innerHTML, $.parseHTML($(this).parent()[0].innerHTML)[3].innerHTML]);
        } else { // remove from favorites
          if (index < 2) { // to make sure we can remove if the element is array[0]
            favoriteTweets = favoriteTweets.slice(1);
          } else {
            favoriteTweets.splice(index - 2, 1);
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
      message.username = activeUserName || $('.userNameInput').val();
      message.text = activeUserText = $('.userTextInput').val() || 'no message was supplied';
      message.roomname = activeUserRoom = $('.userRoomInput').val();
      initialRoomStateSet = false;
      postMessage(message);
    });
    $('.nameSubmit').on('click', function() {
      message.username = activeUserName = $('.userNameInput').val();
    });
    // === MESSAGES === // 
    var activeUserName = undefined;
    var activeUserText = undefined;
    var activeUserRoom = undefined;
    var message = {
      username: activeUserName,
      text: activeUserText,
      roomname: 'all'
    };
    // === FUNCTION INVOCATIONS === // 
    getMessage(appendChats);
    // every 10 seconds we refresh chats
    setInterval(refreshChats, 6000);
    // once a minute we enable a refresh of the options in the rooms dropdown.
    setInterval(function() {
      initialRoomStateSet = false;
    }, 30000);
  });
})();
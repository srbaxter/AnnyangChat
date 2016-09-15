// Relies heavily on Kyle Getson's pen (https://codepen.io/kylegetson/pen/NNRbyb)

var isListening;
var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Listen to the mic. Turns on the browser's mic if not on
function resume() {
  $(".recording").css("background-color", "red");
  isListening = true;
  annyang.resume();
}

// Stop listening to the mic (but the browser is still listening)
function pause() {
  $(".recording").css("background-color", "grey");
  isListening = false;
  annyang.pause();
}

// Turn off the browser's mic
function abort() {
  $(".recording").css("background-color", "grey");
  isListening = false;
  annyang.abort();
}

// Displays words that should be read. Delays printout for effect
function respond(words, html) {
  // Split by space
  var wordsArr = words.split(" ");
  $("#greeting").text("");
  $("#speechResults").text("");

  // Speak the words
  speak(words);

  // Go over each of the words, displaying each with a delay
  for (var i = 0; i < wordsArr.length; i++) {
    setTimeout(function(word, x) {
      $("#greeting").append(" " + word);
      // If this is the last item, append any HTML data we may want to display
      if (html && x == wordsArr.length - 1) {
        $("#speechResults").html(html);
      }
    }, (300 * (i + .5)), wordsArr[i], i);
  }
}

// Gives browser a voice
function speak(text, voiceName) {
  abort();
  var msg = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(msg);
  msg.onend = resume;
}

// Press enter in the text box to say something/have it act as a voice command
$('#command').keypress(function(event) {
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == '13') {
    micInput($("#command").val());
  }
});

// Press escape to turn on/off the mic
$(document).keyup(function(e) {
  var keycode = (e.keyCode ? e.keyCode : e.which);
  if (keycode == 27) {
    if (isListening) {
      abort();
    } else {
      resume();
    }
  }
});

// Fake mic input
function micInput(words) {
  annyang.getSpeechRecognizer().onresult(mockResult(words));
}

// Annyang doesn't have a method of testing this without getting actual results. This allows for input from anything
function mockResult(sentence) {
  var event = document.createEvent('CustomEvent');
  event.initCustomEvent('result', false, false, {
    'sentence': sentence
  });
  event.resultIndex = 0;
  event.results = {
    'length': function() {
      return 1;
    },
    0: {
      0: {
          'transcript': sentence,
          'confidence': 0.99,
      }
    }
  };
  Object.defineProperty(event.results[0], 'length', {
    get: function() {
      return 1;
    }
  });
  return event;
};


// Calculate a tip percentage plus the total
var calculateTip = function(number, total) {
  var newtotal = parseFloat(total);
  if (newtotal < 0 || number < 0) {
    respond("Error. I can't calculate your new total. Please try again.");
    return;
  }
  var tip = newtotal * (number/100);
  var pay = newtotal + tip;
  respond("Your new total is $" + pay); 
}

// Says what today's date and weekday is plus current time
var calculateNow = function() {
  var today = new Date();
  var hours = today.getHours();
  var twelvehours = " AM";
  if (hours > 12) {
    hours -= 12;
    twelvehours = " PM";
  }
  var now = weekdays[today.getDay()] + ", " + months[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear() + ". The time is now " + hours + ":" + today.getMinutes() + twelvehours + "."
  respond("Today is " + now); 
}

// A word is matched
var matched = function(word) {
  respond("You correctly pronounced the word \"" + word.trim() + ".\"");
}

// User needs to know available commands
var help = function() {
  respond("Here is a list of things you can ask: ", Object.keys(commands).join(" <br />"));
}

// No other commands fit the voice command
function noMatch(results) {
  respond("I don't know what \"" + results[0].trim() + "\" is. Please try again.");
}

// All of the commands that will be responded to
window.onload = function() {
  if (annyang) {
    // Define a command.
    var commands = {
      ':number percent tip on :total': calculateTip,
      'what is today': calculateNow,
      'pronounce :word': function(word) {
        respond(word);
      },
      'what is :number times :number': function(x, y) {
        respond(x + " times " + y + " is " + parseInt(x) * parseInt(y));
      },
      'what\'s up': function() {
        respond("What What, Turkey Butt");
      },
      'help': help,
      ":term": matched    
      };

      // Add our commands to annyang
      annyang.addCommands(commands);

      // Start listening.
      annyang.start();
      annyang.addCallback('resultNoMatch', noMatch);
    
      setTimeout(function() {
        respond("Hi! Let's Chat! To see a list of commands, type or say \"Help.\"");
      }, 500);  
    }
  }
}
var matched = function(word) {
  respond("You correctly pronounced the word \"" + word.trim() + ".\"");
}

 // in case we need help
  var help = function() {
    respond("Here is a list of things you can say: ", Object.keys(commands).join(" <br />"));
  }

window.onload = function() {

if (annyang) {
  // Let's define a command.
   var commands = {
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
      respond("Hi! Let's Chat! To see a list of commands, say \"Help.\"");
    }, 500);  
}
}
var isListening;
// listen to the mic, turns on the browser's mic if its not on
function resume() {
  $(".recording").css("background-color", "red");
    isListening = true;
    annyang.resume();
}

// stop listening to the mic (but the browser is still listening)
function pause() {
    $(".recording").css("background-color", "grey");
    isListening = false;
    annyang.pause();
}

// turn off the browser's mic
function abort() {
    $(".recording").css("background-color", "grey");
    isListening = false;
    annyang.abort();
}

// displays words that should be read, delay added for effect
function respond(words, html) {
    //split by space
    var wordsArr = words.split(" ");
    $("#greeting").text("");
    $("#speechResults").text("");

    // speak the words
    speak(words);

    // go over each of the words, displaying each with a delay
    for (var i = 0; i < wordsArr.length; i++) {
      setTimeout(function(word, x) {
        $("#greeting").append(" " + word);
        // if this is the last item, append any html data we may want to display
        if (html && x == wordsArr.length - 1) {
            $("#speechResults").html(html);
        }
      }, (300 * (i + .5)), wordsArr[i], i);
    }
}

// give your browser a voice
function speak(text, voiceName) {
    abort();
    var msg = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(msg);
    msg.onend = resume;
}

// press enter in the text box to say something
$('#command').keypress(function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode == '13') {
      micInput($("#command").val());
    }
});

// press escape to turn on/off the mic
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

// this is the function that lets us fake mic input
function micInput(words) {
  annyang.getSpeechRecognizer().onresult(mockResult(words));
}

// annyang doesnt have a method of testing this without getting actual results, this allows for input from anything
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

function noMatch(results) {
  respond("I don't know what \"" + results[0].trim() + "\" is. Please try again.");
}


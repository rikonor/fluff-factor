var scoreDep = new Deps.Dependency();

updateText = function() {
  $('#main-text').html(synthElements(getMainTextWords()));
};

updatePage = function() {
  console.log("Updating page");
  scoreDep.changed();
  updateText();
};

if (Meteor.isClient) {
  
  Template.main.helpers({
    score: function() {
      scoreDep.depend();
      return rateWords(getMainTextWords());
    }
  });

  Template.main.events({
    'click #rate-button': updatePage,
    'click .word': function(evt) {
      var word = evt.target.innerText;
      Session.set('chosenWord', word);
    }
  });

  Template.wordMenu.helpers({
    'chosenWord': function() {
      return Session.get('chosenWord') || 'N/A';
    },
    'chosenWordScore': function() {
      var word = Words.findOne({word: Session.get('chosenWord')});
      return (word && word.fluff) || 0;
    }
  });

  Template.wordMenu.events({
    'click #vote-up': function() {
      var word = Session.get('chosenWord');
      var w = Words.findOne({word: word});
      if (!w) {
        Words.insert({word: word, fluff: 1});
      } else {
        Words.update({_id: w._id}, {$set: {fluff: w.fluff + 1}});
      }
    },
    'click #vote-down': function() {
      var word = Session.get('chosenWord');
      var w = Words.findOne({word: word});
      if (!w) {
        Words.insert({word: word, fluff: -1});
      } else {
        Words.update({_id: w._id}, {$set: {fluff: w.fluff - 1}});
      }
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    // MockWords.forEach(function(word) {
    //   Words.insert(word);
    // });
  });
}

getMainTextWords = function() {  
  var mainText = $("#main-text").text().trim();

  if (!mainText || mainText == "") return [];

  words = mainText.split(" ");

  // Need to sanitize input, remove unwanted chars, etc
  words = words.filter(function(word) { return word != " " && word != "" });

  return words;
};

rateWord = function(wordToFind) {
  var word = Words.findOne({word: wordToFind.toLowerCase()});
  return word ? word.fluff : 0;
};

rateWords = function(words) {
  var score = 0;
  words.forEach(function(word) {
    score += rateWord(word);
  });
  return score;
};

fluffClass = function(word) {
  var w = Words.findOne({word: word});
  if (!w) { return "fluff-0" }

  var fluffClass = "fluff-0"
  if (w.fluff > 0) {
    fluffClass = "fluff-3"
  }
  return fluffClass;
};

synthElements = function(words) {
  var elements = [];
  words.forEach(function(word) {
    elements.push('<span class="word ' + fluffClass(word) + '">' + word + '</span>');
  });
  return elements.join(" ");
};

// wordMenu = function(word) {
//   console.log("Chosen word:", word);
//   var w = Words.findOne({word: word});
//   w = w ? w : {word: word, fluff: 0};
//   console.log(w);
//   if (w._id) {
//     Words.update({_id: w._id}, {$set: {fluff: w.fluff + 1}});
//   } else {
//     w.fluff += 1;
//     Words.insert(w);
//   }
// };
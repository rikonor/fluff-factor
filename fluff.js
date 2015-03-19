var scoreDep = new Deps.Dependency();

if (Meteor.isClient) {
  
  Template.main.helpers({
    score: function () {
      scoreDep.depend();
      return rateWords(getMainTextWords());
    }
  });

  Template.main.events({
    'paste #main-text': function() {
      scoreDep.changed();
    },
    'click #rate-button': function() {
      scoreDep.changed();
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
  var mainText = $("#main-text").val();
  if (!mainText || mainText == "") return [];

  words = mainText.split(" ");

  // Need to sanitize input, remove unwanted chars, etc

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
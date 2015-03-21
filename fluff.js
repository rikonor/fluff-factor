var textDep = new Deps.Dependency();

updateText = function() {
  $('#main-text').html(synthElements(getMainTextWords()));
};

updatePage = function() {
  console.log("Updating page");
  textDep.changed();
  updateText();
};

if (Meteor.isClient) {
  
  Template.main.helpers({
    score: function() {
      textDep.depend();
      return rateWords(getMainTextWords());
    },
    wordsCount: function() {
      textDep.depend();
      return getMainTextWords().length;
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

  Meteor.startup(function() {
    initExample();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // MockWords.forEach(function(word) {
    //   Words.insert(word);
    // });
  });
}

sanitizeWord = function(word) {
  var startIndex = word.search(/\w/g);
  var endIndex = word.length - word.split('').reverse().join('').search(/\w/g);
  return word.substr(startIndex, endIndex).toLowerCase();
};

getMainTextWords = function() {  
  var mainText = $("#main-text").text().trim();

  if (!mainText || mainText == "") return [];

  words = mainText.split(" ");

  // Need to sanitize input, remove unwanted chars, etc
  words = words.map(function(word) { return sanitizeWord(word); });
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
  if (w.fluff > 0 && w.fluff <= 1) {
    fluffClass = "fluff-1"
  } else if (w.fluff > 1 && w.fluff <= 2) {
    fluffClass = "fluff-2"
  } else if (w.fluff > 2) {
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

initExample = function() {
  var initText =
    "Welcome to the fluff factor. " +
    "Please feel free to use this website to get a fluff score of any text. " +
    "Click any word to see it's current fluff score. " +
    "Simply paste your text and click 'Rate text' to see which words are fluffing up your text. " +
    "The amazing nimbus 2000 is truly asounding"

  $('#main-text').text(initText);
  updatePage();
};
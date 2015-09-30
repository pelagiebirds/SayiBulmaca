# SayiBulmaca
Guess the Number. You can play against AI.

##How to setup?

The game requires jQuery. Include jQuery first. Then add sayi.bulmaca.js with a script tag in the head section.

##How to initialise the game?

Just add a div tag in the HTML file. Then add a script tag with this piece of code.

```
$(document).ready(function() {
  var gameContainer = $(selector);
  new SayiBulmaca(gameContainer);
});
```

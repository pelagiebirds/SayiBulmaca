# SayiBulmaca
Guess the Number. You can play against AI.

##How to setup?

The game requires jQuery and Bootstrap. Include sayi.bulmaca.js after them.

##How to initialise the game?

Just add a div tag in the HTML file. Then add a script tag with this piece of code.

```
$(document).ready(function() {
  var gameContainer = $(selector);
  new SayiBulmaca(gameContainer);
});
```

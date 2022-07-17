# :bank: Bank Teller Management Game
A game that simulates a work day for a bank teller environment.

<!-- PUBLISHED LINK -->
:link: [Open project hosted in AWS Amplify](https://guiche.andremr.dev/)

<!-- ABOUT -->
## :page_with_curl:	About the project
As a challenging purpose, I decided to use just vanilla HTML/CSS/JS. Single-page, 3 files. No framework or library.

### :construction:	Built with
* [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
* [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
* [Javascript](https://developer.mozilla.org/en/JavaScript)

<!-- USAGE -->
## :video_game:	Basic usage
These are basic usage information for a player's perspective. More details players will have to find out by playing, it's part of the game. :)
* The objective is to serve customers within the waiting period, trying to use the minimum budget possible.
* Customers arrive between 10 am and 3 pm and office closes at 4 pm.
* You can score with documents processed and customers served within the deadline.
* You will be penalized by customer complaints, triggered when customers wait too long, abandon the wait or are refused.
* Teller activations debit the budget, and end-of-day reactivations credit partially.
* You have 3 difficulty levels.
* When a match starts, you have 10 game minutes to setup your first tellers. You can activate more any time upto budget limit. Once a teller is activated you can only de-activate it after 3 pm and if it's not serving any customer.
* Then you will be watching waiting lines and tellers status, attending new customers before they enter by themselves, changing tellers type and so on.
* It's better to check game Statistics tab while in a match and after a match ends, to see what did wrong and get better score next time.
* Your score after each match will be saved into your browser's "local storage", and you can check it in Statistics tab.

<!-- NOTES FOR DEVELOPERS -->
## :keyboard:	Notes for developers
#### :game_die: RNG
The game logic makes use of a lot of basic random generated numbers with probability percentages, affecting many aspects of the simulation, from difficulty level to behaviors based on game time.
#### :arrows_counterclockwise:	Game loop
Game loop is made using basic _setInterval_ function just to simplify, since it doesn't need high refresh rate or precision.
#### :iphone: Responsiveness
I made basic responsiveness using pure CSS to fit a default widescreen monitor and a portrait oriented phone.
#### :earth_americas:	Language
For now, the user interface (html text) is all in Brazilian Portuguese. On the other hand, all code is in English.

<!-- FINAL CONSIDERATIONS -->
## Final considerations
I wrote this simulation game years ago for Windows Phone with C# and Unity3D, when I was learning programming.
Unfortunately I didn't make any backups and lost the entire project. So I decided to write it again from scratch, this time as part of learning about web development.

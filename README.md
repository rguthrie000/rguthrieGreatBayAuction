# auction.js - rguthrie's GreatBay Auction
v2, 20200405

GreatBay auction is a simple node.js CLI database app using mySQL.
Packages clear, chalk, figlet, and readline are used to provide the
CLI user experience.

The user can enter establish categories, and within categories products and
reserve bids.  The user can enter new bids which are accepted if greater than
reserve/last bid.  Display functions show the current state of products in a 
category.

# Design
 
A simple menuing system is implemented using readline and console.log for terminal
I/O.  The input line handler is a simple state machine which has top-level
'WELCOME' and lower-level 'CATEGORY' states to be able to segregate application
of commands.  Commands relate directly to CRUD operations in the database.
Packages clear, chalk, and figlet are used for CLI presentation enhancement.

## This application was developed with:
VS Code - Smart Editor for HTML/CSS/JS
node.js - JavaScript command-line interpreter
Google Chrome - browser for development of the output webpage
Google Chrome Inspector - inspection/analysis tools integrated in Chrome Browser.

## Versioning

GitHub is used for version control; the github repository is 
rguthrie000/rguthrieGreatBayAuction.

## Author
rguthrie000 (Richard Guthrie)

## Acknowledgments
rguthrie000 is grateful to the UCF Coding Bootcamp - we rock!


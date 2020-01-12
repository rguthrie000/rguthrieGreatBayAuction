// Great Bay Auction, UCF-ORL-FSF week 6, day 4, exercise 10
// rguthrie, 20200112

//*@*@*@ MAKE YOUR PASSWORD THE DEFAULT IN ./mysqlConnect.js @*@*@*

//********************
//*   Dependencies   *
//********************

const clear     = require("clear");
const chalk     = require("chalk");
const figlet    = require("figlet");
const readline  = require('readline');
const openMySQL = require('./mysqlConnect.js');

//***************
//*   Globals   *
//***************

// state values and variable
const WELCOME   = 0;
const CATEGORY  = 1;
let state = WELCOME;  // the start state is WELCOME

// information shared by state machine and database functions
let itemsStr = '';
let categories = [];
let selectedCategory = '';

//*****************
//*   Functions   *
//*****************

// the database functions are two-part functions: query and response. the response is the callback,
// which happens sometime later. so we always write the prompt for the user
// as part of the response handling from the previous request. each database function either calls
// prompt() directly or uses readCategories() or readItems(), which call prompt() in their response
// handling. if a database function may or may not perform a second query, then it must have a call
// to readCategories() or readItems() or prompt() for both paths in the code. the code in the response
// handling for the second query will run last.


// CREATE database function to add items
// strategy -- only adds an item if it isn't already in the database.
function createItem(category, item, startBid = 100) {
    //first determine whether the item+category is already in the table.
    connection.query('SELECT * FROM auctions WHERE item_name=? AND category=?', [item,category],
    (err,res) => {
        if (err) throw err;
        // if there are any matches, the length is not 0, so the item's already there.
        if (res.length == 0) {
            // otherwise insert the item
            connection.query("INSERT INTO auctions (item_name,category,starting_bid) VALUES (?,?,?);", [item,category,startBid],
            (err,res) => {
                if (err) throw err;
                // even though there is a readCategories() below 'if (res.length == 0)...', this
                // call must be here so it will be *after* the INSERT query.
                readCategories();
            });
        } else {
            // if the INSERT doesn't happen, this must happen anyway.
            readCategories();
        }
    });
}

// READ database functions
// strategy -- DISTINCT is used to get the unique category names only.
// each is pushed into a global array for use by prompt()
function readCategories() {
    connection.query('SELECT DISTINCT category FROM auctions',
    (err,res) => {
        if (err) throw err;
        categories = [];
        for (let i = 0; i < res.length; i++) {
            categories.push(res[i].category);
        }
        if (selectedCategory) {
            readItems(selectedCategory);
        } else {
            prompt();
        }
    });
}

// also a read function
// strategy -- WHERE is used to get the items from one category only.
// items are written as lines in one long global string for use by prompt()
function readItems(category) {
    connection.query("SELECT * FROM auctions WHERE category=?", [category],
    (err, res) => {
        if (err) throw err;
        itemsStr = [];
        for (let i = 0; i < res.length; i++) {
            // add the item_name, starting_bid, and highest_bid as a line in itemsStr.
            // first write the item_name, but count the characters.
            let itemChars = res[i].item_name.split(''); 
            for (var j = 0; j < itemChars.length; j++) {
                itemsStr += itemChars[j];
            }
            // then pad out a full 20-character field
            for (; j < 20; j++) {itemsStr += ' ';}
            // now tack on the reserve and high bid
            itemsStr += `reserve ${res[i].starting_bid}\thigh bid ${res[i].highest_bid}\n`;
        }
        prompt();
    });
}

// UPDATE database function
// strategy -- this function implements the bidding logic; only qualifying bids are taken.
function updateItem(category, item, bid) {
    connection.query('SELECT * FROM auctions WHERE category=? AND item_name=?', [category,item],
    (err,res) => {
        if (err) throw err;
        // if the item's there...
        if (res.length && (bid >= res[0].starting_bid && bid > res[0].highest_bid)) {
            // bid is as large as the reserve and larger than the highest bid, so update the highest bid.
            connection.query('UPDATE auctions SET highest_bid=? WHERE id=?', [bid,res[0].id],
            (err, res) => {
                if (err) throw err;
                readItems(category);
            });
        } else {           
            readItems(category);
        }
    });
}

// DELETE database function
// strategy - make sure the item is there before trying to delete it!
function deleteItem(category, item) {
    connection.query('SELECT * FROM auctions WHERE category=? AND item_name=?', [category,item],
    (err,res) => {
        if (err) throw err;
        // if the item's there...
        if (res.length) {
            connection.query('DELETE FROM auctions WHERE id=?', [res[0].id],
            (err, res) => {
                if (err) throw err;
                readItems(category);
            });
        } else {    
            readItems(category);
        }
    });
}

// prompt() is the endpoint of the response handling for all database queries.
function prompt() {
    clear();
    console.log(chalk.yellow(figlet.textSync('Great Bay Auction', { horizontalLayout: 'full' })));
    switch (state)
    {
        case WELCOME:
            console.log(chalk.green("Welcome!\nChoose 'done' | <category> | 'add <category> <item> <reserve bid>'"));
            if (categories.length == 0) {
                console.log(chalk.blue('No items yet'));
            } else {
                console.log(chalk.blue(`Categories: ${categories.join(' ')}`));
            }
            break;
        case CATEGORY:
            console.log(chalk.green(`Category: ${selectedCategory}\nChoose 'change' | add <item> <reserve bid> | bid <item> <new bid> | remove <item>`));
            console.log(itemsStr);
            break;
    }
}

// nextCommand() is the input handler. there are two states; at WELCOME only the categories are shown.
// Choosing a category transitions to CATEGORY state, where all items in the category are shown.
function nextCommand(line) {
    let words = line.toLowerCase().split(" ");
    switch (state)
    {
        case WELCOME:
            switch (words[0])
            {
                case 'done':
                    connection.end();
                    console.log(chalk.red('Auction has ended. All goods sold to their highest bidder!'));
                    rl.close();
                    break;
                case 'add':    
                    createItem(words[1], words[2], Number(words[3]));
                    break;
                default:
                    let matchIndex = categories.indexOf(words[0]);
                    if (matchIndex == -1) {
                        readCategories();
                    } else {
                        selectedCategory = categories[matchIndex];
                        state = CATEGORY;
                        readItems(selectedCategory);
                    }   
                    break;
            }
            break;
        case CATEGORY:
            switch (words[0])
            {
                // 'done' will do the same thing as 'change'
                case 'done':
                case 'change':
                    state = WELCOME;
                    selectedCategory = '';
                    readCategories();
                    break;
                case 'add':
                    createItem(selectedCategory, words[1], Number(words[2]));
                    break;
                case 'bid':
                    updateItem(selectedCategory, words[1], Number(words[2]));
                    break;
                case 'remove':
                    deleteItem(selectedCategory, words[1]);
                    break;
            }
            break;
    }
}

//***************
//*   Startup   *
//***************

// Open a mySQL connection and select an existing database.
// Two additional arguments may be provided: username, password.
// In mysqlConnect.js, the definition of openMySQL has these arguments
// with *my* defaults, so the working version of this function is 
// not pushed. I have provided 'mysqlConnect_inspect.js' to show 
// the code without providing defaults for username and password.
let connection = openMySQL('greatbay_db'); 

// set up the CLI
const rl = readline.createInterface({input:process.stdin,output:process.stdout});

// initialize the state machine.
// the state machine is already initialized by 'let state = WELCOME;'

// throw out the first prompt. 
readCategories();

// register the console input handler.
// 'line' is a keyword directing the event monitor to call nextCommand() when 
// a newline-terminated string has been collected from the terminal.
rl.on('line',nextCommand);

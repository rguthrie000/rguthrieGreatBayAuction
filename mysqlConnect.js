const mysql = require("mysql");

module.exports = function openMySQL(database, host, port, username, password) {
    let connection = mysql.createConnection({
        host: host,
        port: port,
        user: username,
        password: password,
        database: database
    });
    connection.connect((err) => {
        if (err) throw err; 
        // console.log(`connected. threadId: ${connection.threadId}\n`);
    });
    return(connection);
}
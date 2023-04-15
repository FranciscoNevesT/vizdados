const path = require('path');
var express = require('express');
var mapaRouter = express.Router();
const backdirname = path.dirname(__dirname);


const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('sql/pos_doc.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});


mapaRouter.get("", async function(req, res, next){
    res.render(path.resolve(__dirname, "../views/mapa.html"));
})

module.exports = mapaRouter;
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

mapaRouter.get('/data/distinct/:id', function(req, res, next){

    const id =req.params.id

    const query = "SELECT DISTINCT " + id + " FROM pos_doc ORDER BY " + id  + " ASC"

    console.log(query)

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})

mapaRouter.get('/data/knowledge/:id', function(req, res, next){

    const id =req.params.id

    const query = "SELECT DISTINCT knowledge_area FROM pos_doc WHERE evaluation_area = '" + id + "'  ORDER BY knowledge_area ASC"

    console.log(query)

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})






module.exports = mapaRouter;
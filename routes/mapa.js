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

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})

mapaRouter.get('/data/research/:evaluation/:knowledge', function(req, res, next){
    const eval = req.params.evaluation
    const know = req.params.knowledge




    var query = "SELECT DISTINCT research_line FROM pos_doc WHERE"

    if (eval == 0){
        query = query + " NOT evaluation_area = -1 AND"
    }else{
        query = query + " evaluation_area = '" + eval + "' AND"
    }

    if (know == 0){
        query = query + " NOT knowledge_area = -1"

    }else{
        query = query + " knowledge_area = '" + know + "'"
    }

    query = query + "  ORDER BY research_line ASC"

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})






module.exports = mapaRouter;
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


mapaRouter.get('/data/triples/:evaluation/:knowledge/:research', function(req, res, next){

    var query =`Select e.name as evaluation_area, k.name as knowledge_area, l.name as research_line
    FROM evaluation_area_knowledge_area_research_line as ekl 
    INNER JOIN evaluation_area as e on ekl.evaluation_area_id = e.id
    INNER JOIN knowledge_area as k on ekl.knowledge_area_id = k.id
    INNER JOIN research_line as l on ekl.research_line_id = l.id
    `
    
    
    const values = [req.params.evaluation,req.params.knowledge,req.params.research]
    const names = ["evaluation_area","knowledge_area","research_line"]

    var first = true
    for(var i = 0; i < names.length; i++){
        if(values[i] != 0){
            if(first){
                query += " WHERE  "
            }else{
                query += " AND "
            }
            query += names[i] + " = '" + values[i] + "'"
            first = false
        }

    }
    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });

})

mapaRouter.get('/data/distinct/:id', function(req, res, next){

    const id =req.params.id

    const query = "SELECT DISTINCT NAME FROM " + id + " ORDER BY name ASC "


    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})

// Pesquisa generica

mapaRouter.get('/data/search/:evaluation/:knowledge/:research/:level/:start/:end/:keywords', function(req, res, next){
    const eval = req.params.evaluation
    const know = req.params.knowledge
    const rese = req.params.research
    const level = req.params.level
    const keywords = req.params.keywords

    const yearStart = req.params.start
    const yearEnd = req.params.end

    var values = [eval,know,rese,level]
    var name = ['evaluation_area','knowledge_area','research_line','level']

    var query = "SELECT state.name as state , COUNT(*) as count, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER() AS proportion\n"
    query += "FROM (SELECT * FROM pos_doc WHERE defense_date BETWEEN '" + yearStart + "/01/01' AND '" + yearEnd + "/12/31') as pd\n"
    query += "INNER JOIN pos_doc_state ON pd.id = pos_doc_state.pos_doc_id\n"    
    query += "INNER JOIN state ON state.id = pos_doc_state.state_id\n"
    
    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " INNER JOIN pos_doc_" + name[i] + " ON pos_doc_" + name[i] + ".pos_doc_id = pd.id"
        query += "\n"
        query += " INNER JOIN (SELECT * FROM " + name[i] + " WHERE " + name[i] + ".name = '" + values[i] + "') as " + name[i] + " ON pos_doc_" + name[i]  + "." + name[i] + "_id = " + name[i] + ".id" 
        query += "\n"

    }

    if(keywords != "$"){
        var keywords_list = keywords.split("_")
        
        var query_keyword = "SELECT DISTINCT pos_doc_id \nFROM pos_doc_keyword\nINNER JOIN keyword on pos_doc_keyword.keyword_id = keyword.id AND ("

        for (k in keywords_list){
            query_keyword += " keyword.name = '" + keywords_list[k] + "'"

            if(k < keywords_list.length - 1){
                query_keyword += " OR "
            }
        }

        query_keyword += ")"

        query += "INNER JOIN (" + query_keyword + ") as keyword on keyword.pos_doc_id = pd.id\n"
    }

    query += " GROUP BY state.name ORDER BY count DESC"

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})

//Pesquisa de rank

mapaRouter.get('/data/rank/:evaluation/:knowledge/:research/:level/:start/:end/:state/:tipo/:keywords', function(req, res, next){
    const eval = req.params.evaluation
    const know = req.params.knowledge
    const rese = req.params.research
    const level = req.params.level
    const state = req.params.state
    const keywords = req.params.keywords

    const yearStart = req.params.start
    const yearEnd = req.params.end

    const tipo = req.params.tipo


    var values = [eval,know,rese,level,state]
    var name = ['evaluation_area','knowledge_area','research_line','level','state']

    var tipoSelect = "";

    if(tipo == "ie"){
        tipoSelect = "institution"
    }else if(tipo == "states"){
        tipoSelect = "state"
    }else if(tipo == "advisor"){
        tipoSelect = "advisor"
    }else{
        tipoSelect = tipo
    }

    var query = "SELECT " + tipoSelect + ".name as label, COUNT(*) as count, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER() AS proportion\n" 

    query += "FROM (SELECT * FROM pos_doc WHERE defense_date BETWEEN '" + yearStart + "/01/01' AND '" + yearEnd + "/12/31') as pd\n"
    query += "INNER JOIN pos_doc_" + tipoSelect + " ON pos_doc_" + tipoSelect + ".pos_doc_id = pd.id\n"
    query += "INNER JOIN (SELECT * FROM " + tipoSelect + " WHERE name != 'NAN') as " + tipoSelect + " ON pos_doc_" + tipoSelect + "." + tipoSelect + "_id = " + tipoSelect + ".id\n"

    for(var i = 0; i < values.length; i++){
        if(values[i] == 0 || name[i] == tipoSelect){
            continue
        }
        query += " INNER JOIN pos_doc_" + name[i] + " ON pos_doc_" + name[i] + ".pos_doc_id = pd.id"
        query += "\n"
        query += " INNER JOIN (SELECT * FROM " + name[i] + " WHERE " + name[i] + ".name = '" + values[i] + "') as " + name[i] + " ON pos_doc_" + name[i]  + "." + name[i] + "_id = " + name[i] + ".id" 
        query += "\n"

    }

    
    if(keywords != "$"){
        var keywords_list = keywords.split("_")
        
        var query_keyword = "SELECT DISTINCT pos_doc_id \nFROM pos_doc_keyword\nINNER JOIN keyword on pos_doc_keyword.keyword_id = keyword.id AND ("

        for (k in keywords_list){
            query_keyword += " keyword.name = '" + keywords_list[k] + "'"

            if(k < keywords_list.length - 1){
                query_keyword += " OR "
            }
        }

        query_keyword += ")"

        query += "INNER JOIN (" + query_keyword + ") as keyword on keyword.pos_doc_id = pd.id\n"
    }

    query += " GROUP BY " + tipoSelect +  ".name ORDER BY count DESC LIMIT 10\n"

    console.log(query)

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})

//Pesquisa de line chart

mapaRouter.get('/data/line/:evaluation/:knowledge/:research/:level/:start/:end/:state', function(req, res, next){
    const eval = req.params.evaluation;
    const know = req.params.knowledge;
    const rese = req.params.research;
    const level = req.params.level;
    const state = req.params.state;

    const yearStart = req.params.start;
    const yearEnd = req.params.end;

    const values = [eval,know,rese,level,state];
    const name = ['evaluation_area','knowledge_area','research_line','level','state'];

    var query = "SELECT year , COUNT(*) as count\n"
    query += "FROM pos_doc as pd\n"

    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " INNER JOIN pos_doc_" + name[i] + " ON pos_doc_" + name[i] + ".pos_doc_id = pd.id"
        query += "\n"
        query += " INNER JOIN " + name[i] + " ON pos_doc_" + name[i]  + "." + name[i] + "_id = " + name[i] + ".id" 
        query += "\n"

    }

    query += "WHERE pd.defense_date BETWEEN '" + yearStart + "/01/01' AND '" + yearEnd + "/12/31'\n";

    
    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " AND " + name[i] + ".name = '" + values[i] + "'"
        query += "\n"

    }


    query = query + " GROUP BY year ORDER BY year ASC"

    console.log(query)
    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);
        }
    });
})

//Pesquisa de keywords

mapaRouter.get('/data/keyword/:evaluation/:knowledge/:research/:level/:start/:end/:state/:keywords', function(req, res, next){
    const eval = req.params.evaluation;
    const know = req.params.knowledge;
    const rese = req.params.research;
    const level = req.params.level;
    const state = req.params.state;
    const keywords = req.params.keywords
    
    const yearStart = req.params.start;
    const yearEnd = req.params.end;

    const values = [eval,know,rese,level,state];
    const name = ['evaluation_area','knowledge_area','research_line','level','state'];

    var query = "SELECT keyword.name as word , COUNT(*) as count\n"
    query += "FROM pos_doc as pd\n"
    query += " INNER JOIN pos_doc_keyword ON pos_doc_keyword.pos_doc_id = pd.id\n"

    if(keywords != "$"){
        var keywords_list = keywords.split("_")
        
        var query_keyword = "SELECT DISTINCT pos_doc_id \nFROM pos_doc_keyword\nINNER JOIN keyword on pos_doc_keyword.keyword_id = keyword.id AND ("

        for (k in keywords_list){
            query_keyword += " keyword.name = '" + keywords_list[k] + "'"

            if(k < keywords_list.length - 1){
                query_keyword += " OR "
            }
        }

        query_keyword += ")"

        query += "INNER JOIN (" + query_keyword + ") as keyword_f on keyword_f.pos_doc_id = pd.id\n"
    }
    
    query += " INNER JOIN keyword ON pos_doc_keyword.keyword_id = keyword.id\n"

    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " INNER JOIN pos_doc_" + name[i] + " ON pos_doc_" + name[i] + ".pos_doc_id = pd.id"
        query += "\n"
        query += " INNER JOIN " + name[i] + " ON pos_doc_" + name[i]  + "." + name[i] + "_id = " + name[i] + ".id" 
        query += "\n"

    }

    query += "WHERE pd.defense_date BETWEEN '" + yearStart + "/01/01' AND '" + yearEnd + "/12/31'\n";

    
    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " AND " + name[i] + ".name = '" + values[i] + "'"
        query += "\n"

    }


    query = query + " GROUP BY pos_doc_keyword.keyword_id ORDER BY count DESC LIMIT 400"

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

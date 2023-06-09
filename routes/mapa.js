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

mapaRouter.get('/data/search/:evaluation/:knowledge/:research/:level/:start/:end', function(req, res, next){
    const eval = req.params.evaluation
    const know = req.params.knowledge
    const rese = req.params.research
    const level = req.params.level

    const yearStart = req.params.start
    const yearEnd = req.params.end


    var values = [eval,know,rese,level]
    var name = ['evaluation_area','knowledge_area','research_line','level']
    var name_s = ["e","k","r","l"]

    var query =`SELECT s.name as state , COUNT(*) as count, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER() AS proportion
    FROM pos_doc as pd
    INNER JOIN pos_doc_state as pds ON pd.id = pds.pos_doc_id
    INNER JOIN state as s ON s.id = pds.state_id
    `
    


    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        var pd_s = "pd" + name_s[i]
        query += " INNER JOIN pos_doc_" + name[i] + " as " + pd_s + " ON pd.id = " + pd_s + ".pos_doc_id"
        query += "\n"
        query += " INNER JOIN " + name[i] + " as " + name_s[i] + " ON " + pd_s + "." + name[i] + "_id = " + name_s[i] + ".id" 
        query += "\n"

    }

    query += " WHERE defense_date BETWEEN '" + yearStart + "/01/01' AND '" + yearEnd + "/12/31'";

    for(var i = 0; i < values.length; i++){
        if(values[i] != 0){
            query += "\n"
            query += " AND " + name_s[i] + ".name = '" +  values[i] + "'"
        }
        
    }
    query += "\n"

    query += " GROUP BY s.name"

    db.all(query, (err, rows) => {
        if (err) {
            console.error(err.message);
        } else {
            res.json(rows);

        }
    });
})

//Pesquisa de rank

mapaRouter.get('/data/rank/:evaluation/:knowledge/:research/:level/:start/:end/:state/:tipo', function(req, res, next){
    const eval = req.params.evaluation
    const know = req.params.knowledge
    const rese = req.params.research
    const level = req.params.level
    const state = req.params.state

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
        console.log("Erro: " + tipo)
    }

    var query = "SELECT " + tipoSelect + ".name as label, COUNT(*) as count, COUNT(*) * 1.0 / SUM(COUNT(*)) OVER() AS proportion\n" 

    query += "FROM pos_doc as pd\n"
    query += "INNER JOIN pos_doc_" + tipoSelect + " on pos_doc_" + tipoSelect + ".pos_doc_id = pd.id\n"
    query += "INNER JOIN " + tipoSelect + " on pos_doc_" + tipoSelect + "." + tipoSelect + "_id = " + tipoSelect + ".id\n"

    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " INNER JOIN pos_doc_" + name[i] + " ON pos_doc_" + name[i] + ".pos_doc_id = pd.id"
        query += "\n"
        query += " INNER JOIN " + name[i] + " ON pos_doc_" + name[i]  + "." + name[i] + "_id = " + name[i] + ".id" 
        query += "\n"

    }


    query += "WHERE pd.defense_date BETWEEN '" + yearStart + "/01/01' AND '" + yearEnd + "/12/31' AND " + tipoSelect + ".name != 'NAN'\n";

    for(var i = 0; i < values.length; i++){
        if(values[i] == 0){
            continue
        }
        query += " AND " + name[i] + ".name = '" + values[i] + "'"
        query += "\n"

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

mapaRouter.get('/data/keyword/:evaluation/:knowledge/:research/:level/:start/:end/:state', function(req, res, next){
    const eval = req.params.evaluation;
    const know = req.params.knowledge;
    const rese = req.params.research;
    const level = req.params.level;
    const state = req.params.state;

    const yearStart = req.params.start;
    const yearEnd = req.params.end;

    const values = [eval,know,rese,level,state];
    const name = ['evaluation_area','knowledge_area','research_line','level','state'];

    var query = "SELECT keyword.name as word , COUNT(*) as count\n"
    query += "FROM pos_doc as pd\n"
    query += " INNER JOIN pos_doc_keyword ON pos_doc_keyword.pos_doc_id = pd.id\n"
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


    query = query + " GROUP BY pos_doc_keyword.keyword_id ORDER BY count DESC LIMIT 100"

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

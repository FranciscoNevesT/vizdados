//Configurações do servidor
const fs = require('fs');

const express = require('express');
const app = express();

app.use(express.static('.'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var mapa = require("./routes/mapa.js");


app.use("/",mapa);


app.listen(3000);
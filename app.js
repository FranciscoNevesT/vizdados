//Configurações do servidor
const fs = require('fs');

const express = require('express');
const app = express();

app.use(express.static('.'));

app.listen(3000);
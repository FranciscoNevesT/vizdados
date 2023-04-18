//Fazendo o mapa

var map = L.map('map').setView([37.8, -96], 4);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");


async function updateMap(){
    
    fetch('/data/search/' + evaluation.value + '/' + knowledge.value + '/' + research.value + '/' + level.value + '/' +  startYear.value + '/' +  endYear.value)
    .then(response => response.json())
    .then(data => {
  
        console.log(data)
     
  });

  
    

}


search.addEventListener("click", function(){
    updateMap();
})
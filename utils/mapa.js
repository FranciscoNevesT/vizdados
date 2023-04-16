//Fazendo o mapa

var map = L.map('map').setView([37.8, -96], 4);

var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


//Avaliacao

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");

function propageEvaluation(){
    console.log(evaluation.value)
    
    //Clear
    while (knowledge.firstChild) {
        knowledge.removeChild(knowledge.firstChild);
      }

    const newOption = document.createElement('option');
    newOption.value = 0
    newOption.textContent = "ALL"

    knowledge.appendChild(newOption)

    if (evaluation.value == 0){
        fetch('/data/distinct/knowledge_area')
        .then(response => response.json())
        .then(data => {

            var size = Object.keys(data).length

            console.log(size)

            for(let i = 0; i < size; i++){
                const newOption = document.createElement('option');

                newOption.value = data[i].knowledge_area
                newOption.textContent = data[i].knowledge_area

                knowledge.appendChild(newOption)
            }   
        });
    }
    else{

        fetch('/data/knowledge/' + evaluation.value )
        .then(response => response.json())
        .then(data => {

            var size = Object.keys(data).length

            console.log(size)

            for(let i = 0; i < size; i++){
                const newOption = document.createElement('option');

                newOption.value = data[i].knowledge_area
                newOption.textContent = data[i].knowledge_area

                knowledge.appendChild(newOption)
            }   
        });


    }
}


fetch('/data/distinct/evaluation_area')
  .then(response => response.json())
  .then(data => {

    var size = Object.keys(data).length

    console.log(size)

    for(let i = 0; i < size; i++){
        const newOption = document.createElement('option');

        newOption.value = data[i].evaluation_area
        newOption.textContent = data[i].evaluation_area

        evaluation.appendChild(newOption)
    }   
    propageEvaluation()
});


evaluation.addEventListener("input", function (){
    propageEvaluation()
})
// Conhecimento






//Nivel

const level = document.getElementById("artLevel");

fetch('/data/distinct/level')
  .then(response => response.json())
  .then(data => {

    var size = Object.keys(data).length

    console.log(size)

    for(let i = 0; i < size; i++){
        const newOption = document.createElement('option');

        newOption.value = data[i].level
        newOption.textContent = data[i].level

        level.appendChild(newOption)
    }   
});



// Anos

const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const yearRange = document.getElementById('year-range');

function updateYearRange() {
    const startValue = parseInt(startYear.value);
    const endValue = parseInt(endYear.value);
  
    yearRange.textContent = `${startValue} - ${endValue}`;
  }

startYear.addEventListener('input', function() {
    if (parseInt(startYear.value) > parseInt(endYear.value)) {
      endYear.value = startYear.value;
    }
  
    updateYearRange();
  });
  
endYear.addEventListener('input', function() {
    if (parseInt(endYear.value) < parseInt(startYear.value)) {
      startYear.value = endYear.value;
    }
  
    updateYearRange();
  });

updateYearRange();

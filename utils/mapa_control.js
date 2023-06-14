// Conhecimento
const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");

function cleanSelect(objeto) {
  var selectElement = objeto;
  var selectedOptions = Array.from(objeto.selectedOptions);
  
  // Clear all options
  selectElement.innerHTML = "";
  
  // Add selected options back to the select element
  selectedOptions.forEach(function(option) {
    selectElement.appendChild(option);
  });

  if(selectedOptions[0] != 0){
    var option = document.createElement('option');
    option.value = 0;
    option.textContent = "ALL";
    selectElement.appendChild(option)
  }
}

async function fill(objeto,values){
  for (const item of values) {
    var option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    objeto.appendChild(option);
  }

}

async function apply_filter(){

  cleanSelect(evaluation)
  cleanSelect(knowledge)
  cleanSelect(research)

  const data =  await (await fetch('/data/triples/' + evaluation.value + "/" + knowledge.value + "/" + research.value)).json()
  
  var evaluation_options = []
  var knowledge_options = []
  var research_options = []

  for(var i = 0; i< data.length; i++){
    evaluation_options.push(data[i].evaluation_area)
    knowledge_options.push(data[i].knowledge_area)
    research_options.push(data[i].research_line)
  }

  evaluation_options = Array.from(new Set(evaluation_options)).sort()
  fill(evaluation,evaluation_options);
  knowledge_options = Array.from(new Set(knowledge_options)).sort()
  fill(knowledge,knowledge_options);


  research_options = Array.from(new Set(research_options)).sort()
  
  // Isso acaba atrasando bastante o carregamento das opçoes
  if(evaluation.value != 0 || knowledge.value != 0){
    fill(research,research_options)
  }


}


evaluation.addEventListener("input",apply_filter)
knowledge.addEventListener("input",apply_filter)
research.addEventListener("input",apply_filter)


apply_filter()

//Nivel

const level = document.getElementById("artLevel");

fetch('/data/distinct/level')
  .then(response => response.json())
  .then(data => {

    var size = Object.keys(data).length

    console.log(size)

    for(let i = 0; i < size; i++){
        const newOption = document.createElement('option');

        newOption.value = data[i].name
        newOption.textContent = data[i].name

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

var filterOptions = document.querySelector('.filter-options');
var configOptions = document.querySelector('.config-options');

/*Filter tab*/

const filter_button = document.getElementById("tab_filter");

filter_button.addEventListener("click", async () => {
  
  configOptions.classList.remove('show');
  filterOptions.classList.toggle('show');
});


/* Config tab*/

const config_button = document.getElementById("tab_config");

config_button.addEventListener("click", async () => {
  
  filterOptions.classList.remove('show');
  configOptions.classList.toggle('show');
});
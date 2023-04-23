// Conhecimento
const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");


async function propageKnowledge(){
  // Clear research select options
    research.innerHTML = '';

    // Add default "All" option
    const allOption = document.createElement('option');
    allOption.value = '0';
    allOption.textContent = 'ALL';
    research.appendChild(allOption);

    try {
      let url = '/data/research/' + evaluation.value + "/" + knowledge.value;

      const response = await fetch(url);
      
      const data = await response.json();

      for (const item of data) {
        const option = document.createElement('option');
        option.value = item.research_line;
        option.textContent = item.research_line;
        research.appendChild(option);
      }

    } catch (error) {
      console.error(error);
    }
}

knowledge.addEventListener("input", function (){
  propageKnowledge()
})


//Avaliacao

async function propageEvaluation(){
    // Clear knowledge select options
    knowledge.innerHTML = '';

    // Add default "All" option
    const allOption = document.createElement('option');
    allOption.value = '0';
    allOption.textContent = 'ALL';
    knowledge.appendChild(allOption);

    try {
      let url = '/data/distinct/knowledge_area';
  
      if (evaluation.value !== '0') {
        url = '/data/knowledge/' + evaluation.value;
      }
  
      const response = await fetch(url);
      
      const data = await response.json();
  
      for (const item of data) {
        const option = document.createElement('option');
        option.value = item.knowledge_area;
        option.textContent = item.knowledge_area;
        knowledge.appendChild(option);
      }
    } catch (error) {
      console.error(error);
      propageKnowledge();
    }
    propageKnowledge();
}

async function populateEvaluationArea() {
  fetch('/data/distinct/evaluation_area')
    .then(response => response.json())
    .then(data => {
      for (const item of data) {
        const option = document.createElement('option');
        option.value = item.evaluation_area;
        option.textContent = item.evaluation_area;
        evaluation.appendChild(option);
      }
      propageEvaluation();
    });
}


evaluation.addEventListener("input", function (){
    propageEvaluation()
})

populateEvaluationArea()

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

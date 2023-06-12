const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");

//Read the data
async function getKeywordData(state = 0) {
    const response = await fetch(`/data/keyword/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}/${state}`);
    const data = await response.json();
      console.log('keyword data:\n\n');
    console.log(data);
    return data;
  }


async function drawWordCloud(id,data) {
    // Cleanup to make room for the next cloud
    d3.select(id).selectAll('*').remove();
  
    // List of words
    var myWords = data;
  
    var numWords = 0;

    for (let i in myWords) {
      numWords += myWords[i].count;
    }
    
    var maxSize = 0
    for (let i in myWords) {
      myWords[i].size = myWords[i].count / numWords;

      if(maxSize < myWords[i].size){
        maxSize = myWords[i].size
      }
    }
  
    // Set the dimensions and margins of the graph
    var margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 800 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;
  
    // Append the SVG object to the body of the page
    var svg = d3.select("#wordcloud").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
    // Constructs a new cloud layout instance. It runs an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout.cloud()
      .size([width, height])
      .words(myWords.map(function (d) { return { text: d.word, size: d.size }; }))
      .padding(5) // Space between words
      .rotate(function () { return ~~(Math.random() * 2) * 90; })
      .fontSize(function (d) { return 90*d.size/maxSize; }) // Adjust the scaling factor (50) as needed
      .on("end", draw);
    layout.start();
  
    // This function takes the output of 'layout' above and draws the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      svg.append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function (d) { return d.size + "px"; })
        .style("fill", "#69b3a2")
        .attr("text-anchor", "middle")
        .style("font-family", "Impact")
        .attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function (d) { return d.text; });
    }
  }


search.addEventListener("click", async () => {
    drawWordCloud("#wordcloud", await getKeywordData())
});

export {getKeywordData, drawWordCloud};
import * as d3 from 'https://unpkg.com/d3?module'

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");

const margin = {top: 20, right: 30, bottom: 40, left: 90};
const width = 460 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

async function getRankData(tipo,state = 0) {
  const response = await fetch(`/data/rank/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}/${state}/${tipo} `);
  const data = await response.json();
  console.log(data);
  return data;
}

function drawRankChart(id, data) {
  d3.select(id).selectAll('*').remove();

  let max = -Infinity;

  for (let i = 0; i < data.length; i++){
    if (data[i].proportion > max){
      max = data[i].proportion
    }
  }
  console.log(max)

  const svg = d3.select(id)
    .append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, max])
    .range([0, width]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

  const y = d3.scaleBand()
    .range([0, height])
    .domain(data.map(d => d.label))
    .padding(.1);
  svg.append("g")
    .call(d3.axisLeft(y))

  // create a tooltip
  var Tooltip = d3.select(id)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    const dataD = d.srcElement.__data__

    console.log()
    Tooltip
      .html("Trabalhos: " + dataD.count + "<br> Proporção: " + (dataD.proportion* 100).toFixed(2) + "%" )
      .style("left", (d3.pointer(this)[0]+70) + "px")
      .style("top", (d3.pointer(this)[1]) + "px")
  }


  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  svg.selectAll("myRect")
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", d => y(d.label))
    .attr("width", d => x(d.proportion))
    .attr("height", y.bandwidth())
    .style("stroke-width", 4)
    .style("stroke", "none")
    .style("opacity", 0.8)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

search.addEventListener("click", async () => {
  const [ieData, statesData] = await Promise.all([
    getRankData('ie'),
    getRankData('states'),
  ]);
  drawRankChart("#rank_ie", ieData);
  drawRankChart("#rank_states", statesData);
});


export {getRankData,drawRankChart};
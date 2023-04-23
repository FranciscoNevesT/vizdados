import * as d3 from 'https://unpkg.com/d3?module'

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");


// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


var data = await fetch(`/data/rank/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}/ie`);
var data = await data.json();

var svg  = d3.select("#rank_ie")
.append('svg')
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

const x = d3.scaleLinear()
.domain([0, 13000])
.range([ 0, width]);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x))
.selectAll("text")
  .attr("transform", "translate(-10,0)rotate(-45)")
  .style("text-anchor", "end");

// Y axis
const y = d3.scaleBand()
.range([ 0, height ])
.domain(data.map(d => d.label))
.padding(.1);
svg.append("g")
.call(d3.axisLeft(y))

//Bars
svg.selectAll("myRect")
.data(data)
.join("rect")
.attr("x", x(0) )
.attr("y", d => y(d.label))
.attr("width", d => x(d.count))
.attr("height", y.bandwidth())

console.log(data);

//import 'https://d3js.org/d3.v4.js';
import * as d3 from 'https://unpkg.com/d3?module'

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");

// set the dimensions and lineMargins of the graph
const margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

//Read the data
async function getLineData(state = 0) {
  const response = await fetch(`/data/line/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}/${state}`);
  const data = await response.json();
	console.log('line data:\n\n');
  console.log(data);
	// Parse data into line-able format
  return data;
}

function drawLineChart(id, data) {
  // Cleanup to make room for next linechart
  d3.select(id).selectAll('*').remove();

  // Append the svg object to the body of the page
  const svg = d3.select("#line_chart")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add X axis --> it is a date format
	var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.year; }))
    .range([ 0, width ]);
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d) { return +d.count; })])
		.range([ height, 0 ]);
	svg.append("g")
		.call(d3.axisLeft(y));

	// Add the line
	svg.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", "steelblue")
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.x(function(d) { return x(d.year) })
			.y(function(d) { return y(d.count) })
			)   
}

search.addEventListener("click", async () => {
  const data = await getLineData();
  drawLineChart("#line_chart", data);
});

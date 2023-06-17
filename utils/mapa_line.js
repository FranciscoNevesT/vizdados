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
const margin = {top: 30, right: 30, bottom: 50, left: 60},
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
		.call(d3.axisBottom(x).tickFormat(d3.format("d")));

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function(d) { return +d.count; })])
		.range([ height, 0 ]);
	svg.append("g")
		.call(d3.axisLeft(y));

  // title
  svg.append("text")
    .attr("x", (width/2))
    .attr("y", 0 - (margin.top/2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Total de publicações por ano");

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

	// Draw the point bullets
	svg.selectAll(".point")
	.data(data)
	.enter()
	.append("circle")
	.attr("class", "point")
	.attr("cx", d => x(d.year))
	.attr("cy", d => y(d.count))
	.attr("r", 4)
	.on("mouseover", mouseover)
	.on("mouseout", mouseleave);

	// Function to show the tooltip

	var Tooltip = d3.select(id)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

	function mouseover(d) {
		Tooltip.style("opacity", 1);

		d3.select(this)
		  .style("stroke", "black")
		  .style("opacity", 1);
	  
		const dataD = d.toElement.__data__;
	  
		var value = dataD.count;
	  
		if (relative_line.checked) {
		  value = (value * 100).toFixed(2);
		}
	  
		Tooltip
		  .html("Count: " + value)
		  .style("left", (d3.pointer(this)[0] + 70) + "px")
		  .style("top", (d3.pointer(this)[1] + margin.top + 10) + "px");
	}

	function mouseleave() {
		Tooltip
		.style("opacity", 0)
	  d3.select(this)
		.style("stroke", "none")
		.style("opacity", 0.8)
	}

}

async function update(){
	const data = await getLineData();

	if(relative_line.checked){
	var pre = 0
	for(let i = 0; i<data.length; i++){
	  if(pre == 0){
		  pre = data[i].count
		  data[i].count = 0
	  }
	  else{
	  var s = data[i].count
	  data[i].count = s/pre
	  pre = s}
  
	}}
	console.log(data.length)
	console.log(data[0])
	console.log(data)
	drawLineChart("#line_chart", data);
}

const relative_line = document.getElementById("relative_line")

search.addEventListener("click", async () => {
	update()
});

relative_line.addEventListener("click", async () => {
	update()
});

export {getLineData, drawLineChart};

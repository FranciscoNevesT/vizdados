//import 'https://d3js.org/d3.v4.js';
import * as d3 from 'https://unpkg.com/d3?module'

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");
const selectedKeywords = document.getElementById("selectedKeywords");

// set the dimensions and lineMargins of the graph
const margin = {top: 30, right: 30, bottom: 50, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

function formatYearlyData(data,tipo) {
  const yearlydata = {};
  data.map((item) => {
    if (Object.hasOwn(yearlydata, item.year)) {
	  if(tipo == "all"){
	    yearlydata[item.year] += item.count;
	  }else if(tipo == "min"){
		yearlydata[item.year] = Math.min(yearlydata[item.year],item.count);
	  }else if(tipo == "max"){
		yearlydata[item.year] = Math.max(yearlydata[item.year],item.count);
	  }else if(tipo == "mean"){
		yearlydata[item.year].push(item.count);
	  }
      
    } else {
	  if(tipo == "mean"){
		yearlydata[item.year] = [item.count];
	  }else{
		yearlydata[item.year] = item.count;
	  }
      
    }
  });
  console.log(yearlydata);
  let yearlyarray = [];
  for (let year in yearlydata) {
	if(tipo == "mean"){
	  var sum = yearlydata[year].reduce((acc, num) => acc + num, 0);
	  var mean = sum / yearlydata[year].length;
	  yearlyarray.push({"year": year, "count": mean});  
	}
	else{
	  yearlyarray.push({"year": year, "count": yearlydata[year]});
	}
    
  }
  return yearlyarray;
}
//Read the data
async function getLineData(state ) {

	var keywords = selectedKeywords.getElementsByTagName("li")

	var keyword_text = []
	for (var i = 0; i < keywords.length; i++) {
		var keyword = keywords[i].textContent;
		keyword_text.push(keyword)
	}

	keyword_text = keyword_text.join("_")

	if(keyword_text.length == 0){
		keyword_text = "$"
	}

  const response = await fetch(`/data/line/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}/${state}/${keyword_text}`);
  const data = await response.json();

  return data
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
    var x = {}
	
	data.forEach((lineData,index) => {
		x[index] = d3.scaleTime()
		.domain(d3.extent(lineData, function(d) { return d.year; }))
		.range([ 0, width ]);
		
	}) 
	
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x[0]).tickFormat(d3.format("d")));


    // Add Y axis
    var y =  {}

	data.forEach((lineData,index) => {
		y[index] =  d3.scaleLinear()
        .domain([0, d3.max(lineData, function(d) { return +d.count; })])
        .range([ height, 0 ]);
	})
	
	
    svg.append("g")
        .call(d3.axisLeft(y[0]));


  //Adding title
  svg.append("text")

  .attr("class", "graph-title")
  .attr("x", width / 2)
  .attr("y", -margin.top / 2)
  .attr("text-anchor", "middle")
  .text("Total de publicações por ano");

  svg.select(".graph-title")
  .attr("font-size", "16px")
  .attr("font-weight", "bold");

    // Add total data line
	data.forEach((lineData,index) => {
		svg.append("path")
        .datum(lineData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function(d) { return x[index](d.year) })
            .y(function(d) { return y[index](d.count) })
            ) 
	})


}

var data_r = null

async function update(state = 0,clean = true){

	var data = null

	if(clean){
		data = await getLineData(state);
		data_r = JSON.parse(JSON.stringify(data));
	}else{
		data = JSON.parse(JSON.stringify(data_r));
	}

	if(data == null){
		return 
	}

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
			pre = s
			}
		
		}
	}	

	if(mmm_line.checked){
		var datas = [formatYearlyData(data,"max"),formatYearlyData(data,"mean"),formatYearlyData(data,"min")]
	}else{
		var datas = [formatYearlyData(data,"all")]
	}

	

	console.log(data.length)
	console.log(data[0])
	console.log(data)
	drawLineChart("#line_chart", datas);
}

const relative_line = document.getElementById("relative_line")
const mmm_line = document.getElementById("mmm_line")

search.addEventListener("click", async () => {
    update()
});

relative_line.addEventListener("click", async () => {
    update(0, false)
});


mmm_line.addEventListener("click", async () => {
    update(0, false)
});


export {getLineData,update, drawLineChart};

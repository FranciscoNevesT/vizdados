import {getRankData,drawRankChart} from './mapa_rank.js';
import {getLineData,drawLineChart} from './mapa_line.js';

//Fazendo o mapa
var map = L.map('map', { zoomControl: false }).setView([-15, -56], 4);

map.dragging.disable();
map.boxZoom.disable();
map.touchZoom.disable();
map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.boxZoom.disable();
map.keyboard.disable();


var tiles = L.tileLayer(
	'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
	{attribution: 
	'<a href="www.geoboundaries.org">geoBoundaries</a>'}
	).addTo(map);
	

const evaluation = document.getElementById("artEvaluation");
const knowledge = document.getElementById("artKnowledge");
const research = document.getElementById("artResearch");
const level = document.getElementById("artLevel");
const startYear = document.getElementById('start-year');
const endYear = document.getElementById('end-year');
const search = document.getElementById("search");

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML = '<h4>Pós graduações</h4>' +  (props ?
      '<b>' + props.name + '</b><br /> Trabalhos: ' + props.count + '</b><br /> Proporção: ' + (props.density * 100).toFixed(2) + '%'
      : 'Passe o mouse sobre os estados');
};

info.addTo(map);

let geojson = null;

//Cores dos estados
function getColor(value) {

  var threshold = 1/10

  if(value > threshold){
    return "#3CB043"
  }
  else if( value > threshold / 2){
    var hue = 240
  }else{
    var hue = 0
  }

  var saturation = (value - threshold/2)*(value - threshold/2);
  saturation *= 4/(threshold*threshold)
  saturation = saturation * 100
  console.log(threshold)
  console.log(saturation)
  console.log( (value - threshold))
  console.log("A")
  var lightness = 50;

  if(value == 0){
    saturation = 0;
    lightness = 0;
  }


  return `hsl( ${hue} ${saturation}% ${lightness}%)`;
  }

function style(feature) {
  return {
      fillColor: getColor(feature.properties.density),
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
  };
}

function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
      weight: 5,
      color: '#666',
      dashArray: '',
      fillOpacity: 0.7
  });

  info.update(layer.feature.properties);

  layer.bringToFront();
}

function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}


async function clickFeature(e) {
  const state = e.sourceTarget.feature.properties.name

  const ieData = await getRankData("ie",state)
  drawRankChart("#rank_ie", ieData);
  const lineData = await getLineData(state)
  drawLineChart("#line_chart", lineData);
}


function onEachFeature(feature, layer) {
  layer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: clickFeature
  });
}


const fetchBrasilJson = async () => {
    try {
      const response = await fetch('boundaries/geoBoundaries-BRA-ADM1.geojson');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
  
  
const updateMap = async () => {
  try {
    // Remove the previous layer if it exists
    if (geojson) {
      map.removeLayer(geojson);
    }

    const response = await fetch(`/data/search/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}`);
    const data = await response.json();
    console.log(data)
    const brasilJson = await fetchBrasilJson();

    const statesData = {"type":"FeatureCollection", "features": []};

    for (let x = 0; x < 27; x++) {
      const stateSG = brasilJson.features[x].properties.shapeISO.split("-")[1];

      var zeroT = true
      for (const c in data) {
        const values = data[c];
        if (stateSG == values.state) {
          const entry = {"type":"Feature","id":x,"properties":{"name":stateSG,"count":values.count,"density":values.proportion},"geometry":brasilJson.features[x].geometry};
          statesData.features.push(entry);
          zeroT = false
          break;
        }
      }

      if(zeroT){
        const entry = {"type":"Feature","id":x,"properties":{"name":stateSG,"count":0,"density":0},"geometry":brasilJson.features[x].geometry};
        statesData.features.push(entry);
      }
    }

    geojson = L.geoJson(statesData, {
      id: 'values',
      style : style,
      onEachFeature: onEachFeature
    }).addTo(map);
  } catch (error) {
    console.error(error);
  }
};
  
search.addEventListener("click", () =>{
  updateMap();
} );


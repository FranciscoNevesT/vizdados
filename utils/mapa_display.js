import {getRankData,drawRankChart} from './mapa_rank.js';
import {getLineData,update,drawLineChart} from './mapa_line.js';
import {getKeywordData, drawWordCloud} from './mapa_wordcloud.js';

//Fazendo o mapa
var map = L.map('map', { zoomControl: false }).setView([-15, -54], 4);

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
const selectedKeywords = document.getElementById("selectedKeywords");

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


var geojson = null;
var verticalLines = null;

var threshold = 1/10

//Cores dos estados
function getColor(value) {
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
  var lightness = 50;


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

var line_lenght = 3
function lineStyle (feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'black'
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
  const advisorData = await getRankData("advisor",state)
  const evaluationData = await getRankData("evaluation_area",state)
  const knowledgeData = await getRankData("knowledge_area",state)
  const keywordData = await getKeywordData(state);
  
  drawRankChart("#rank_ie", ieData);
  drawRankChart("#rank_advisor", advisorData);
  drawRankChart("#rank_evaluation_area", evaluationData);
  drawRankChart("#rank_knowledge_area", knowledgeData);
  drawWordCloud("#wordcloud", keywordData);

  update(state)
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

    if (verticalLines) {
      map.removeLayer(verticalLines);
    }

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

    const response = await fetch(`/data/search/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}/${keyword_text}`);
    const data = await response.json();
    console.log(data)
    const brasilJson = await fetchBrasilJson();

    // Create a GeoJSON layer for the color of the map
    const statesData = {"type":"FeatureCollection", "features": []};

    // Create a GeoJSON layer for the vertical lines
    var lineData = {
      "type": "FeatureCollection",
      "features": []
    };

    for (let x = 0; x < 27; x++) {
      const stateSG = brasilJson.features[x].properties.shapeISO.split("-")[1];

      var zeroT = true

      var rankpostion = 0
      for (const c in data) {
        const values = data[c];
        rankpostion++
        if (stateSG == values.state) {

          // Color map
          const entry = {"type":"Feature","id":x,"properties":{"name":stateSG,"count":values.count,"density":values.proportion},"geometry":brasilJson.features[x].geometry};
          statesData.features.push(entry);
          zeroT = false

          // Line map
          var angle = 45 + (rankpostion-1)*(90/26)
          angle = angle *(Math.PI/180)

          const center = L.geoJSON(brasilJson.features[x].geometry).getBounds().getCenter();
          const lineFeature = {
            "type": "Feature",
            "properties":{"rank":rankpostion},
            "geometry": {
              "type": "LineString",
              "coordinates": [[center.lng, center.lat], [center.lng + line_lenght * Math.cos(angle), center.lat + line_lenght * Math.sin(angle)]] // Adjust the vertical line length as needed
            }
          };
          lineData.features.push(lineFeature);
          break;
        }
      }

      if(zeroT){
        const entry = {"type":"Feature","id":x,"properties":{"name":stateSG,"count":0,"density":0},"geometry":brasilJson.features[x].geometry};
        statesData.features.push(entry);
        rankpostion = 27
        // Line map
        var angle = 45 + (rankpostion-1)*(90/26)
        angle = angle *(Math.PI/180)

        const center = L.geoJSON(brasilJson.features[x].geometry).getBounds().getCenter();
        const lineFeature = {
          "type": "Feature",
          "properties":{"rank":rankpostion},
          "geometry": {
            "type": "LineString",
            "coordinates": [[center.lng, center.lat], [center.lng + line_lenght * Math.cos(angle), center.lat + line_lenght * Math.sin(angle)]] // Adjust the vertical line length as needed
          }
        };
        lineData.features.push(lineFeature);
      }
    }

    geojson = L.geoJson(statesData, {
      id: 'values',
      style : style,
      onEachFeature: onEachFeature
    }).addTo(map);

    verticalLines = L.geoJson(lineData, {
      style: lineStyle
    }).addTo(map);


  } catch (error) {
    console.error(error);
  }
};
  
search.addEventListener("click", async () =>{
  updateMap();
} );

var scale = L.control();

scale.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'scalebar'); // create a div with a class "scalebar"
  this.update();
  return this._div;
};

scale.update = function (props) {
  this._div.innerHTML = `
  
  <div class="color-square green-square"></div>
  <div class="square-text">Acima de 10%</div>
  <div class="color-bar">
  <div class="mark" style="left: 25%;"></div>
  <div class="mark" style="left: 50%;"></div>
  <div class="mark" style="left: 75%;"></div>
  <div class="mark" style="left: 100%;"></div>
  <div class="mark-label" style="left: 25%;">2.5%</div>
  <div class="mark-label" style="left: 50%;">5%</div>
  <div class="mark-label" style="left: 75%;">7.5%</div>
  <div class="mark-label" style="left: 100%;">10%</div>
  </div>
  `;
};

scale.addTo(map);
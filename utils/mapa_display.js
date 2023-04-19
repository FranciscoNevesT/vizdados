//Fazendo o mapa

var map = L.map('map').setView([37.8, -96], 4);

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
  
  let layer = null;
  
  const updateMap = async () => {
    try {
      // Remove the previous layer if it exists
      if (layer) {
        map.removeLayer(layer);
      }
  
      const response = await fetch(`/data/search/${evaluation.value}/${knowledge.value}/${research.value}/${level.value}/${startYear.value}/${endYear.value}`);
      const data = await response.json();
      const brasilJson = await fetchBrasilJson();
  
      const statesData = {"type":"FeatureCollection", "features": []};
  
      for (let x = 0; x < 27; x++) {
        const stateSG = brasilJson.features[x].properties.shapeISO.split("-")[1];
  
        for (const c in data) {
          const values = data[c];
          if (stateSG == values.state) {
            const entry = {"type":"Feature","id":x,"properties":{"name":stateSG,"density":values.count},"geometry":brasilJson.features[x].geometry};
            statesData.features.push(entry);
          }
        }
      }
  
      layer = L.geoJson(statesData, {
        id: 'values'
      }).addTo(map);
    } catch (error) {
      console.error(error);
    }
  };
  
  search.addEventListener("click", updateMap);
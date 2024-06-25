// Initialize the map
mapboxgl.accessToken = "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";

const config = {
  container: "map",
  style: "mapbox://styles/fddvisuals/clsnduc8o01tx01qrgf7ubzyu",
  minZoom: 2.5443617869623485,
  maxZoom: 2.5443617869623485,
  center: [-179.27464330494598, 10.728509690340346]
};
const map = new mapboxgl.Map(config);

const filterGroup = document.getElementById("filter-group");
let categories = [];

map.on("load", () => {

  // map.dragPan.disable();
  // map.scrollZoom.disable();
  // map.doubleClickZoom.disable();
  // map.touchZoomRotate.disableRotation();

  // Load data and add image only once map has loaded
  Promise.all([
    map.addSource("data", {
      type: "geojson",
      data: "src/data.geojson"
    }),
    new Promise((resolve, reject) => {
      map.loadImage("src/twemoji_flag-china.png", function (error, image) {
        if (error) reject(error);
        else {
          map.addImage("my-icon", image);
          resolve();
        }
      });
    })
  ])
  .then(() => initializeLayers())
  .catch(err => console.error(err));

});

function initializeLayers() {
  map.addLayer({
    id: "bri-countries",
    type: "symbol",
    source: "data",
    layout: {
      "icon-image": "my-icon",
      "icon-size": 1,
      "text-field": "{name}",
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 0.6],
      "text-anchor": "top",
    },
    filter: ["in", "ISO_SOV1"].concat(
      categories.find((category) => category.name === "BRI").countries
    ),
  });

  map.addLayer({
    id: "eez-boundaries",
    type: "fill",
    source: "data",
    paint: {
      "fill-color": "rgba(96, 92, 92, 0.5)",
      "fill-opacity": 0.7,
      "fill-outline-color": "#FFFFFF",
    },
  });

  map.addLayer({
    id: "eez-text",
    type: "symbol",
    source: "data",
    layout: {
      "text-field": ["get", "GEONAME"],
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": false,
      "symbol-placement": "point",
      "symbol-spacing": 1000000,
    },
    paint: {
      "text-color": "#FFFFFF",
    },
  });

  updateMap();
}

d3.csv("/src/data.csv")
  .then(data => {
    data.forEach(row => {
      if (!row.countries) {
        console.log(`"countries" is undefined for row ${JSON.stringify(row)} `);
        return;
      }
      
      categories.push({
        name: row.name,
        countries: row.countries.split(", "),
        color: row.color
      });
    });

    categories.forEach(category => {
      const input = createNewElement('input', {
        type: 'checkbox',
        id: category.name,
        checked: true,
        onchange: updateMap
      });
      filterGroup.appendChild(input);

      const label = createNewElement('label', {
        for: category.name,
        textContent: category.name
      });
      filterGroup.appendChild(label);
    });
  })
  .catch(console.error);

function createNewElement(type, properties) {
  const elem = document.createElement(type);
  Object.assign(elem, properties);
  return elem;
}

function updateMap() {
  let checkedCountriesColors = [];
  
  categories.forEach(category => {
    const checkbox = document.getElementById(category.name);
    if (checkbox.checked) {
      category.countries.forEach(country => {
        if (checkedCountriesColors.includes(country)) return;
        checkedCountriesColors.push(country, category.color);
      });
    }
  });

  map.setPaintProperty('eez-boundaries', 'fill-color', [
    "match",
    ["get", "ISO_SOV1"],
    ...checkedCountriesColors,
    "rgba(96, 92, 92, 0.5)"
  ]);
}

map.on('moveend', () => {
  const { lng, lat } = map.getCenter();
  const zoom = map.getZoom();
  const bounds = map.getBounds();

  console.log('Center:', { lng, lat });
  console.log('Zoom:', zoom);
  console.log('Bounds:', bounds);
});

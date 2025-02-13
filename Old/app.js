// Initialize the map
mapboxgl.accessToken =
  "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/fddvisuals/clsnduc8o01tx01qrgf7ubzyu",
  // style: "mapbox://styles/mapbox/light-v11",
  minZoom: 2.5443617869623485,
  maxZoom: 2.5443617869623485,
  center: [-179.27464330494598, 10.728509690340346],

});

// Load GeoJSON data
map.on("load", function () {
  // //no pan
  // map.dragPan.disable();
  // //no movement
  // map.scrollZoom.disable();
  // //no zoom
  // map.doubleClickZoom.disable();
  // //no rotation`
  // map.touchZoomRotate.disableRotation();

  map.addSource("data", {
    type: "geojson",
    data: "src/data.geojson",
  });

  // 1. Load the image using loadImage and add with addImage
  map.loadImage("src/twemoji_flag-china.png", function (error, image) {
    if (error) throw error;
    map.addImage("my-icon", image);
  });

  // 2. Create a new layer using addLayer and specify the icon-image
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
      "fill-color": 
        "rgba(96, 92, 92, 0.5)",
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
});

// Toggleable Filters
const filterGroup = document.getElementById("filter-group");

let categories = [];


d3.csv("/src/data.csv")
  .then(function (data) {
    // Parse each object in the CSV data
    data.forEach(function(row) {
      // Check if 'countries' exists on the row
      if (row.countries !== undefined) {
        // Convert 'countries' string to an array
        let countriesArray = row.countries.split(", ");
    
        // Push each category to the 'categories' array
        categories.push({
          name: row.name,
          countries: countriesArray,
          color: row.color
        });
      } else {
        console.log(`"countries" is undefined for row ${JSON.stringify(row)} `);
      }
    });

    categories.forEach((category) => {
      let input = document.createElement("input");
      input.type = "checkbox";
      input.id = category.name;
      input.checked = true;

      input.addEventListener("change", function () {
        updateMap();
      });

      let label = document.createElement("label");
      label.setAttribute("for", category.name);
      label.textContent = category.name;

      filterGroup.appendChild(input);
      filterGroup.appendChild(label);
    });

  })
  .catch(function (error) {
    console.log(error);
  });




function updateMap() {
  let checkedCountriesColors = [];

  categories.forEach((category) => {
    let checkbox = document.getElementById(category.name);
    if (checkbox.checked) {
      category.countries.forEach(country => {
        // Do not push duplicates into the array
        if (!checkedCountriesColors.includes(country)) {
          checkedCountriesColors.push(country, category.color);
        }
      });
    }
  });

  // Update paint properties  
  map.setPaintProperty('eez-boundaries', 'fill-color', [
    "match",
    ["get", "ISO_SOV1"],
    ...checkedCountriesColors,
    "rgba(96, 92, 92, 0.5)" // Default fill color for unchecked countries
  ]);
}

// Add event listener for when map movement ends
map.on('moveend', function() {
  // Get current center
  var center = map.getCenter();

  // Get current zoom level
  var zoom = map.getZoom();

  var bounds = map.getBounds();

  // Log center and zoom to console
  console.log('Center:', center);
  console.log('Zoom:', zoom);
  console.log('Bounds:', bounds);
});


// Initialize the map
mapboxgl.accessToken =
  "pk.eyJ1IjoiZmRkdmlzdWFscyIsImEiOiJjbGZyODY1dncwMWNlM3pvdTNxNjF4dG1rIn0.wX4YYvWhm5W-5t8y5pp95w";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/fddvisuals/clsnduc8o01tx01qrgf7ubzyu",
  // style: "mapbox://styles/mapbox/light-v11",
  zoom: 3.04,
  center: [153.244, 6.439],
});

// Load GeoJSON data
map.on("load", function () {
  map.addSource("data", {
    type: "geojson",
    data: "src/data.geojson",
  });

  map.addLayer({
    id: "eez-boundaries",
    type: "fill",
    source: "data",
    paint: {
      "fill-color": [
        "match",
        ["get", "ISO_SOV1"],
        ["USA"],
        "#03045e",
        // ["PLW", "FSM", "MHL"],
        // "#104b95",
        // ["JPN", "KOR", "PHL", "THA", "AUS"],
        // "#0096c7",
        // ["TWN"],
        // "rgba(11, 213, 42, 0.69)",
        // ["TLS", "PNG", "SLB", "VUT", "FJI", "TON", "WSM", "KIR"],
        // "#eb0000",
        ["CUB", "CYP", "DOM", "CZE", "DJI", "DMA", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "ETH", "FJI", "GAB", "GMB", "GEO", "GHA", "GRC", "GRD", "GIN", "GNB", "GUY", "HND", "HUN", "IDN", "IRN", "IRQ", "ITA", "JAM", "JOR", "KAZ", "KEN", "KIR", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LTU", "LUX", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MRT", "FSM", "MDA", "MNG", "MNE", "MAR", "MOZ", "MMR", "NAM", "NPL", "NZL", "NIC", "NER", "NGA", "NIU", "MKD", "OMN", "PAK", "PAN", "PNG", "PER", "PHL", "POL", "PRT", "QAT", "ROU", "RUS", "RWA", "WSM", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SVK", "SVN", "SLB", "SOM", "ZAF", "SSD", "LKA", "SDN", "SUR", "SYR", "TJK", "TZA", "THA", "TLS", "TGO", "TON", "TTO", "TUN", "TUR", "TKM", "UGA", "UKR", "ARE", "URY", "UZB", "VUT", "VEN", "VNM", "YEM", "ZMB", "ZWE"],
        "#eb0000",
        "rgba(96, 92, 92, 0.5)",
      ],
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

let categories = [
  { name: "USA", countries: ["USA"], color: "#03045e" },
  { name: "US FAS", countries: ["PLW", "FSM", "MHL"], color: "#104b95" },
  { name: "US Treaty Ally", countries: ["JPN", "KOR", "PHL", "THA", "AUS"], color: "#0096c7" },
  // {
  //   name: "Wang YI",
  //   countries: ["TLS", "PNG", "SLB", "VUT", "FJI", "TON", "WSM", "KIR"],
  //   color: "#eb0000"
  // },
  {name: "Taiwan", countries: ["TWN"], color: "rgba(11, 213, 42, 0.69)"},
  {name: "BRI", countries: ["CUB", "CYP", "DOM", "CZE", "DJI", "DMA", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "ETH", "FJI", "GAB", "GMB", "GEO", "GHA", "GRC", "GRD", "GIN", "GNB", "GUY", "HND", "HUN", "IDN", "IRN", "IRQ", "ITA", "JAM", "JOR", "KAZ", "KEN", "KIR", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LTU", "LUX", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MRT", "FSM", "MDA", "MNG", "MNE", "MAR", "MOZ", "MMR", "NAM", "NPL", "NZL", "NIC", "NER", "NGA", "NIU", "MKD", "OMN", "PAK", "PAN", "PNG", "PER", "PHL", "POL", "PRT", "QAT", "ROU", "RUS", "RWA", "WSM", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SVK", "SVN", "SLB", "SOM", "ZAF", "SSD", "LKA", "SDN", "SUR", "SYR", "TJK", "TZA", "THA", "TLS", "TGO", "TON", "TTO", "TUN", "TUR", "TKM", "UGA", "UKR", "ARE", "URY", "UZB", "VUT", "VEN", "VNM", "YEM", "ZMB", "ZWE"], color: "#eb0000"},
];


//hover color

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

function updateMap() {
  let checkedCountriesColors = [];

  categories.forEach((category) => {
    let checkbox = document.getElementById(category.name);
    if (checkbox.checked) {
      category.countries.forEach(country => {
        checkedCountriesColors.push(country, category.color);
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


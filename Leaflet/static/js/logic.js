// Store our API endpoint inside queryUrl
var earthquakesUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(earthquakesUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the magniture, depth, place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +
            ", Depth: " + feature.geometry.coordinates[2] +
            "</h3>Location: " + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }

    // Create a GeoJSON layer containing the features array on the earthquakeData object - create circles
    var earthquakes = L.geoJSON(earthquakeData, {

        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: markerSize(feature.properties.mag),
                fillColor: colorRange(feature.geometry.coordinates[2]),
                color: "black",
                weight: 0.3,
                opacity: 0.8,
                fillOpacity: 0.8
            });
        },

        // Run the onEachFeature function once for each piece of data in the array
        onEachFeature: onEachFeature
    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap and satellite layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 16,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 16,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 16,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    // Add tectonic plates
    var tectonicPlates = new L.LayerGroup();
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(plateData) {
        L.geoJSON(plateData, {
                color: 'green',
                weight: 1
            })
            .addTo(tectonicPlates);
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Dark Map": darkmap,
        "Street Map": streetmap,
        "Satellite Map": satellitemap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 3,
        layers: [darkmap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create the legend
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        labels = ['<strong>Depth KM</strong>']
        legendlabel = ["< 5", "> 5", "> 10", "> 20", "> 50", "> 100"];
        colors = ['#FCF4A3', '#FDCE2A', '#FD8D3C', '#E31A1C', '#BD0026', '#800026'];

        for (var i = 0; i < legendlabel.length; i++) {
            div.innerHTML += labels.push(
                "<i class='circle' style='background: " + colors[i] + "'></i> " + legendlabel[i] + "<br>");
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };
    // Add legend to the map
    legend.addTo(myMap);
}

// Define colors depending on the depth of the earthquake
function colorRange(d) {
    return d > 100 ? '#800026' :
        d > 50 ? '#BD0026' :
        d > 20 ? '#E31A1C' :
        d > 10 ? '#FD8D3C' :
        d > 5 ? '#FDCE2A' :
        '#FCF4A3';
};

// Reflect the earthquake magnitude
function markerSize(magnitude) {
    return magnitude * 2.5;
};
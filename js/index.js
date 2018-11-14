'use strict';

/***************************
 *** General Leaflet Code ***
 ***************************/
var both = [12919929,12919933,12919945,12919935,12919981,12919941,12919923,12919943,12919983,12919987,12919989,12919919,12919937,12919985,12919927,12919931,12919939,12919925]

var cst =[12920155,12920153,12922875,12919947,12920151,12920149,12919949,904080119]

// Create map and center around Pittsburgh, PA
var map = L.map('map', {
  center: [43.04369147929849, -82.49170303344728],
  zoom: 13
});

// Add mapbox base map
var mapboxAccessToken = 'pk.eyJ1IjoiZGViYm9pdXRyIiwiYSI6IjhlMTk5YzlhZDBiODQ5MWE5NDEzMzE1MjI0OTU4OWJjIn0.jS8URjY-9OvjAv6aTn9I0w';
var mapbox = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light'
}).addTo(map);

var customPop =
  {
  'maxWidth': '500',
  'className' : 'custom'
  }

function onEachCat(feature, layer) {
  layer.on({
    mouseover: highlightCats,
    mouseout: resetCat,
    //click: popLines
  });
}
  
function onEachLine(feature, layer) {
  layer.on({
    mouseover: highlightLines,
    mouseout: resetLine,
    click: popLines
  });
}

function popLines(e) {
  var layer = e.target;
  layer.bindPopup("<b>COMID: </b>" + layer.feature.properties.COMID +
                  "<br /><b>FTYPE: </b><i>" + layer.feature.properties.FTYPE + "<i>",customPop).openPopup();
}

function highlightCats(e) {
  var layer = e.target;
  info.update(layer.feature.properties);
  //alert(cats.parentNode == layer);
}

function highlightLines(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 7,
    color: '#83E7E0',
    dashArray: '',
    fillOpacity: 0.7
  });
}

function highlightLines(e) {
  var layer = e.target;
  layer.setStyle({
    weight: 7,
    color: '#83E7E0',
    dashArray: '',
    fillOpacity: 0.7
  });
}

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

function resetCat(e) {
  info.update();
}

function resetLine(e) {
  e.target.closePopup();
  geojson.resetStyle(e.target);
  info.update();
}
 
var accum2 = L.geoJson(accum2, {
  style: { weight: 7,
    color: "#E52789"}
}).addTo(map);


var cats = L.geoJson(cats, {
  style: { weight: 1,
    color: "#009B7D",
    fillColor: "#009B7D",
    fillOpacity: 0.4},
    onEachFeature: onEachCat,
    zIndex: 4
}).addTo(map);

var themCats = L.geoJson(themCats, {
  style: { weight: 1,
    color: "#A04000",
    fillColor : "#A04000",
    fillOpacity: 0.4,},
    onEachFeature: onEachCat,
    zIndex: 45
}).addTo(map);

var geojson = L.geoJson(flows, {
  style: { weight: 7,
    color: "#333399",
  },onEachFeature: onEachLine,
  zIndex: 47
}).addTo(map);

var qlic = L.control();
qlic.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'qlic'); // create a div with a class "info"
  this._div.innerHTML = ('<b><h4>Click on flowline for COMID and FTYPE</h4></b>');
  return this._div;
};
qlic.addTo(map);

//var StreamCat = L.layerGroup([cats]);
//var HDF = L.layerGroup([themCats]);
var baseLayers  = {
    "MapBox": mapbox,
};
var overlays = {
    "<span style='color: #009B7D'>StreamCat</span>": cats,
    "<span style='color: #A04000'>HDF</span>": themCats,
};

L.control.layers(null,overlays,{collapsed: false,
		position: 'topleft'}).addTo(map);

//div for identifying which catchments are accumulated
var info = L.control({position: 'bottomleft'});
info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    
    this._div.innerHTML = (props ? which(props["FEATUREID"]) : '<b><h3>Hover over catchments</h3></b>');
};

var which = function (p){
  if (both.includes(p)){
    return '<b><h3 style="color:#009B7D">These catchments exist in both flowline accumulations</h3></br>Watershed Area: 22.6152 Sq. KM</b>'
  }
  else {
    return '<b><h3 style="color:#A04000">Red catchments get accumulated into HDF file!</h3></br>Watershed Area: 35.2494 Sq. KM</b>'
  }
};
info.addTo(map);


accum2.bindTooltip("<h4><b>COMID : 12920147</b><br><i>Flowline being accumulated.</i></h4>", {direction: 'top', offset: L.point({x: -8, y: -20}), className: 'ricky'}).openTooltip();
//map.on('click', function(e){alert("You clicked the map at " + e.latlng);});

var marker = L.marker([43.06518, -82.46056]);
marker.addTo(map).bounce(10);
marker.bindTooltip("<h4><b>Upstream COMIDs with FTYPE 'Coastline'<br> don't get accumulated in StreamCat!</b></h4>", {direction: 'right' , className: 'ricky'})

map.on('overlayadd',function(){
  cats.bringToBack();
  themCats.bringToBack();
})

//L.circleMarker([51.505, -0.08], {radius: 80}).addTo(map).bindTooltip('test', {permanent: true, offset: L.point({x: 80, y: -80}), direction: 'left' })
/******************************* 
 *** Code for adding GeoJSON ***
 *******************************/
var geoJsonUrl = 'https://cida.usgs.gov/nldi/comid/12920147/navigate/UT';
// Placeholder for layer. Required to test if layer is added to map or not.
var nldi;

// HTML element to display error message
var errMsgSpan = $('#errorMsg');

// Add layer using vanilla AJAX request
function addDataVanillaJS() {
  if (!mapHasLayer()) {
    var getLayerVanillaJS = new XMLHttpRequest();
    getLayerVanillaJS.open('GET', geoJsonUrl);
    getLayerVanillaJS.send();

    getLayerVanillaJS.onreadystatechange = function(data) {
        if (getLayerVanillaJS.readyState === 4) {
          if (getLayerVanillaJS.status === 200) {
            var geoJsonData = JSON.parse(getLayerVanillaJS.responseText);
            // create a GeoJSON layer
            createNLDIGeoJson(geoJsonData);
          } else {
            // add error message to span         
            var err = getLayerVanillaJS.statusText + ' (' + getLayerVanillaJS.status + ')';
            errMsgSpan.text('Request Failed: ' + err);
            errMsgSpan.show();
          } // end status !== 200 condition
        } // end if (getLayerVanillaJS.readyState === 4)
      } // end getLayerVanillaJS.onreadystatechange()
  } // if (!mapHasLayer())  
} // end addDataVanillaJS()

/************************ 
 *** Helper Functions ***
 ************************/

// create GeoJSON layer, style, add popup, and add to map
function createNLDIGeoJson(data) {
  // see http://leafletjs.com/reference.html#geojson
  nldi = L.geoJson(data, {
    // symbolize features
    style: function(feature) {
      return {
        color: '#00F5FF',
        weight: 2,
        dashArray: 4,
        opacity: 0.74,
      }
    },
  }).addTo(map); // add layer to map
  map.fitBounds(nldi.getBounds());
}

// Test if map has layer
function mapHasLayer() {
  if (map.hasLayer(nldi)) {
    return true;
  } else {
    return false;
  }
}

// Remove layer from map
function removeLayerFromMap() {
  // if layer is on map, remove the layer
  if (mapHasLayer()) {
    map.removeLayer(nldi);
  }
}

/********************* 
 *** Event Handlers ***
 **********************/
// Add layer with XMLHttpRequest()
// tied to <a id="addVanillaJS">
var addVanillaJS = document.getElementById('addVanillaJS');
addVanillaJS.addEventListener('click', addDataVanillaJS);

// Remove layer from map
// tied to <a id="removeLayer">
$('#removeLayer').click(function() {
  removeLayerFromMap();
  errMsgSpan.hide();
});

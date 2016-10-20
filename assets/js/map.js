//init funtion for google maps API to call map and place on document
var map;
var markers = [];
function initMap() {
    map = new google.maps.Map(document.getElementById('mapcanvas'), {
        zoom: 12,
        center: {lat:52.516251, lng: 13.481724},
        mapTypeId: 'terrain'
    });

    // This event listener will call addMarker() when the map is clicked.
    map.addListener('click', function(event) {
        addMarker(event.latLng);
    });

    // Adds a marker at the center of the map.
    Model.restaurants.forEach(function (restaurantItem) {
        var marker = new google.maps.Marker({
            position: location.position,
            map: map
        });
        restaurantItem.marker = marker;
    });
}


// Sets the map on all markers in the array.
function setMapOnAll(map) {
    for (var i = 0; i < Model.restaurants.length; i++) {
        Model.restaurants[i].setMap(map);
    }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
    setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
    setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
    clearMarkers();
    markers = [];
}
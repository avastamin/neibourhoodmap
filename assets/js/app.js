var map;
var markers = [];
//locations array with first 5 locations in forest hills
var Model = {
    restaurants : [
        {
            name: "Lovely Sushi",
            position: {lat: 52.529461, lng: 13.472718},
            description: "Sushi Restaurant"
        }, {
            name: "Allee Bistro",
            position: {lat: 52.535247, lng: 13.496363},
            description: "Sushi Restaurant"
        }, {
            name: "Reisschale",
            position: {lat:52.516251, lng: 13.481724},
            description: "Vietnamese Restaurant "
        }, {
            name: "Chum & Friends",
            position: {lat: 52.513532, lng: 13.458728},
            description: "Pan-Asian Restaurant"
        }, {
            name: "Zhou´s Five",
            position: {lat: 52.504157, lng: 13.473256},
            description: "Asian Restaurant"
        }
    ],
//custom styling of map courtesy of snazzy maps user Simon Goellner
    //styles: [{"featureType":"poi","elementType":"labels.text.fill","stylers":[{"color":"#747474"},{"lightness":"23"}]},{"featureType":"poi.attraction","elementType":"geometry.fill","stylers":[{"color":"#f38eb0"}]},{"featureType":"poi.government","elementType":"geometry.fill","stylers":[{"color":"#ced7db"}]},{"featureType":"poi.medical","elementType":"geometry.fill","stylers":[{"color":"#ffa5a8"}]},{"featureType":"poi.park","elementType":"geometry.fill","stylers":[{"color":"#c7e5c8"}]},{"featureType":"poi.place_of_worship","elementType":"geometry.fill","stylers":[{"color":"#d6cbc7"}]},{"featureType":"poi.school","elementType":"geometry.fill","stylers":[{"color":"#c4c9e8"}]},{"featureType":"poi.sports_complex","elementType":"geometry.fill","stylers":[{"color":"#b1eaf1"}]},{"featureType":"road","elementType":"geometry","stylers":[{"lightness":"100"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"},{"lightness":"100"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffd4a5"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffe9d2"}]},{"featureType":"road.local","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"weight":"3.00"}]},{"featureType":"road.local","elementType":"geometry.stroke","stylers":[{"weight":"0.30"}]},{"featureType":"road.local","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"road.local","elementType":"labels.text.fill","stylers":[{"color":"#747474"},{"lightness":"36"}]},{"featureType":"road.local","elementType":"labels.text.stroke","stylers":[{"color":"#e9e5dc"},{"lightness":"30"}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"visibility":"on"},{"lightness":"100"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#d2e7f7"}]}]
};

var Restaurant = function (data) {
    this.name = ko.observable(data.name);
    this.position = ko.observable(data.position);
    this.description = ko.observable(data.position);
}
//knockout ViewModel
var ViewModel = function(){
    var self = this;
    var searchResult;
    var marker;
    var infowindow;


    self.search_text = ko.observable('');
    self.restaurantList = ko.observableArray([]);
    self.showFilteredMarkers = ko.observable(); // restaurant to store the filter

    //iterates through locations in Model and adds info to markers
    Model.restaurants.forEach(function (restaurantItem) {
        self.restaurantList.push( new Restaurant(restaurantItem));
    });

    // Filter
    self.filterRestaurants = ko.computed(function () {
        if (!self.search_text()) {
            searchResult = self.restaurantList();
        } else {
            searchResult = ko.utils.arrayFilter(self.restaurantList(), function (restaurant) {
                return (
                    (self.search_text().length == 0 || restaurant.name().toLowerCase().indexOf(self.search_text().toLowerCase()) > -1)
                )
            });
        }
        self.showFilteredMarkers(searchResult, self.restaurantList());
        return searchResult;
    });

    self.showFilteredMarkers = function(filteredSearchArray, restaurantsArray) {

        for (var i = 0; i < restaurantsArray.length; i++) {
            //restaurantsArray[i].marker.setVisible(false);
        }

        for (var i = 0; i < filteredSearchArray.length; i++) {

            filteredSearchArray[i].marker.setVisible(true);
        }

    };

    for(var i = 0; i < self.restaurantList().length; i++){

        marker = new google.maps.Marker({
            map: map,
            position: self.restaurantList()[i].position(),
            title: self.restaurantList()[i].name(),
            //content: Model.locations[i].comment,
            animation: google.maps.Animation.DROP,
            icon: 'assets/img/map-marker.png'
        });
        //adding content to infowindow
        infowindow = new google.maps.InfoWindow({
            title: self.restaurantList()[i].name(),
            content: self.restaurantList()[i].description()
        });
        //added click function to toggle Animation
        //color and infowindow props of clicked marker
        marker.addListener('click', function(){
            if (this.getAnimation() !== null) {
                this.setAnimation(null);
                this.setIcon('assets/img/map-marker.png');
                infowindow.close(map, this);
            } else {
                this.setAnimation(google.maps.Animation.BOUNCE);
                this.setIcon('assets/img/map-marker.png');
                infowindow.open(map, this);
            }
        })
        //pushes all premade marker from for loop to markers array defined in //line 2
        markers.push(marker);
    }
}

//init funtion for google maps API to call map and place on document
function initMap() {
    map = new google.maps.Map(document.getElementById('mapcanvas'), {
        center: {lat: 52.516251, lng: 13.481724},
        zoom: 12
    });
    //ensures ViewModel only runs when google maps call returns successful
    ko.applyBindings(ViewModel);
}

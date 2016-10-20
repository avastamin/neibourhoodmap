var map;
var markers = [];
//restaurants array with first 5 restaurants in Berlin
var Model = {
    restaurants : [
        {
            name: "Lovely Sushi",
            position: {lat: 52.529461, lng: 13.472718},
            description: "Sushi Restaurant",
            image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/EZ04y3oDuhWk6Q_crHiqpw/ms.jpg',
            rating_img_url: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png'
        }, {
            name: "Allee Bistro",
            position: {lat: 52.535247, lng: 13.496363},
            description: "Sushi Restaurant",
            image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/EZ04y3oDuhWk6Q_crHiqpw/ms.jpg',
            rating_img_url: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png'
        }, {
            name: "Reisschale",
            position: {lat:52.516251, lng: 13.481724},
            description: "Vietnamese Restaurant ",
            image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/EZ04y3oDuhWk6Q_crHiqpw/ms.jpg',
            rating_img_url: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png'
        }, {
            name: "Chum & Friends",
            position: {lat: 52.513532, lng: 13.458728},
            description: "Pan-Asian Restaurant",
            image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/EZ04y3oDuhWk6Q_crHiqpw/ms.jpg',
            rating_img_url: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png'
        }, {
            name: "Zhou´s Five",
            position: {lat: 52.504157, lng: 13.473256},
            description: "Asian Restaurant",
            image_url: 'https://s3-media2.fl.yelpcdn.com/bphoto/EZ04y3oDuhWk6Q_crHiqpw/ms.jpg',
            rating_img_url: 'https://s3-media2.fl.yelpcdn.com/assets/2/www/img/99493c12711e/ico/stars/v1/stars_4_half.png'
        }
    ],
    yelprestaurants: [] // restaurants will be stored from YelpAPI
};

/**
 * @description Represent Yelp data
 * @constructor
 */
var generateYelpContentString = function () {
    var consumerKey = "DBs4_OjE5q5fKwa7Ij2Wmw";
    var consumerSecret = "yqtTsYBRlvkJ9HDASuzgV5wDKIw";
    var accessToken = "4y_AIdBDaVTfS0sgLAv4rfEbQrk0hetg";
    var accessTokenSecret = "C3McKT9qiuL0s-L_u8rX5OyBX84";

    // to generate random nonce which required by Yelp
    function nonce_generate() {
        return (Math.floor(Math.random() * 1e12).toString());
    }

    var yelp_url = "http://api.yelp.com/v2/search/";

    var parameters = {
        oauth_consumer_key: consumerKey,
        oauth_token: accessToken,
        oauth_nonce: nonce_generate(),
        oauth_timestamp: Math.floor(Date.now() / 1000),
        oauth_signature_method: 'HMAC-SHA1',
        oauth_version: '1.0',
        callback: 'cb',
        term: 'food',
        location: 'Berlin,DE-BE',
        sort: 2,
        limit: 20

    };

    var encodedSignature = oauthSignature.generate('GET', yelp_url, parameters, consumerSecret, accessTokenSecret);
    parameters.oauth_signature = encodedSignature;

    var settings = {
        url: yelp_url,
        data: parameters,
        cache: true,
        dataType: 'jsonp'
    };

    return settings;
};

/**
 * @description Ajax call to get data from yelp and create restaurants data
 * @constructor
 * @param function generateYelpContentString - passed a function as parameter
 * @param Object - return restaurants object on success or through as error
 */
$.ajax(generateYelpContentString())
    .done(function (results) {
        var center = results.region.center;
        createRestaurants(results.businesses);  //  Call a function to generate restaurants data
        initMap(center);  // initiate Google map
    })
    .fail(function () {
        alert("Error loading data from Yelp");
    });

var createRestaurants = function (yelpRestaurants) {
    // To append yelp restaurants data into data model
    yelpRestaurants.forEach(function (data) {
        var restaurantItem = {
            name : data.name,
            position: {lat: data.location.coordinate.latitude, lng: data.location.coordinate.longitude},
            description: data.snippet_text,
            image_url: data.image_url,
            rating_img_url: data.rating_img_url
        }
        Model.yelprestaurants.push(restaurantItem);
    });
};

// Single restaurant model
var Restaurant = function (data) {
    this.name = ko.observable(data.name);
    this.position = ko.observable(data.position);
    this.description = ko.observable(data.description);
    this.image_url = ko.observable(data.image_url);
    this.rating_img_url = ko.observable(data.rating_img_url);
}
//knockout ViewModel
var ViewModel = function(){
    var self = this;
    var searchResult;
    var marker;

    self.search_text = ko.observable('');
    self.restaurantList = ko.observableArray();
    self.showFilteredMarkers = ko.observable(); // restaurant to store the filter

    //iterates through locations in Model and adds info to markers
   Model.restaurants.forEach(function (restaurantItem) {
        self.restaurantList.push( new Restaurant(restaurantItem));
    });

    //Data from Model and adds into restaurantList
    Model.yelprestaurants.forEach(function (restaurantItem) {
        self.restaurantList.push( new Restaurant(restaurantItem));
    });

    // Filter based on user text
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

        // Call showFilteredMarkers to visible only those markers, matched from user input
        self.showFilteredMarkers(searchResult, self.restaurantList());
        return searchResult;
    });

    // To make visible user serach result only
    self.showFilteredMarkers = function(filteredSearchArray, restaurantsArray) {

        for (var i = 0; i < restaurantsArray.length; i++) {
            restaurantsArray[i].marker.setVisible(false);
        }

        for (var i = 0; i < filteredSearchArray.length; i++) {

            restaurantsArray[i].marker.setVisible(true);
        }

    };


    // To Generate marker and it's  other properties
    for(var i = 0; i < self.restaurantList().length; i++){

        marker = new google.maps.Marker({
            map: map,
            position: self.restaurantList()[i].position(),
            title: self.restaurantList()[i].name(),
            animation: google.maps.Animation.DROP,
            icon: 'assets/img/map-marker.png'
        });
        self.restaurantList()[i].marker = marker;

        // InfoWindow content
        var popupContent = '<div id="iw-container">' +
            '<div class="iw-title">' + self.restaurantList()[i].name() +'</div>' +
            '<div class="iw-content">' +
            '<div class="iw-subTitle">Description</div>' +
            '<img src='+ self.restaurantList()[i].image_url() +' alt="' + self.restaurantList()[i].name() +'" height="115" width="83">' +
            '<p>' +self.restaurantList()[i].description()+ '</p>' +
            '<div class="iw-subTitle">Review</div>' +
            '<img class="review" src='+ self.restaurantList()[i].rating_img_url() +' alt="Rating">' +
            '</div>' +
            '<div class="iw-bottom-gradient"></div>' +
            '</div>';

        // Call infoWindowHandler to manage popup content
        infoWindowHandler(marker, popupContent);

        //pushes all premade marker from for loop to markers array defined earlier
        markers.push(marker);
    }

    // generate blank info object
    var infoWindow = new google.maps.InfoWindow();

    /**
     * @description Manupulate popup content
     * @constructor
     * @param {object} marker - map marker
     * @param {string} popupContent - popup content
     */
    function infoWindowHandler(marker, popupContent) {
        google.maps.event.addListener(marker, 'click', function () {
            infoWindow.setContent(popupContent);

            // Reference to the DIV that wraps the bottom of infowindow
            var iwOuter = $('.gm-style-iw');

            /* Since this div is in a position prior to .gm-div style-iw.
             * We use jQuery and create a iwBackground variable,
             * and took advantage of the existing reference .gm-style-iw for the previous div with .prev().
             */
            var iwBackground = iwOuter.prev();

            // Removes background shadow DIV
            iwBackground.children(':nth-child(2)').css({'display' : 'none'});

            // Removes white background DIV
            iwBackground.children(':nth-child(4)').css({'display' : 'none'});

            // Moves the infowindow 115px to the right.
            iwOuter.parent().parent().css({left: '115px'});

            // Moves the shadow of the arrow 76px to the left margin.
            iwBackground.children(':nth-child(1)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

            // Moves the arrow 76px to the left margin.
            iwBackground.children(':nth-child(3)').attr('style', function(i,s){ return s + 'left: 76px !important;'});

            // Changes the desired tail shadow color.
            iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index' : '1'});

            // Reference to the div that groups the close button elements.
            var iwCloseBtn = iwOuter.next();

            // Apply the desired effect to the close button
            iwCloseBtn.css({opacity: '1', right: '38px', top: '3px', border: '7px solid #48b5e9', 'border-radius': '13px', 'box-shadow': '0 0 5px #3990B9'});

            // If the content of infowindow not exceed the set maximum height, then the gradient is removed.
            if($('.iw-content').height() < 140){
                $('.iw-bottom-gradient').css({display: 'none'});
            }

            if (marker.getAnimation() !== null) {

                this.setAnimation(null);
                marker.setIcon('assets/img/map-marker.png');
                infoWindow.close(map, this);
            } else {
                //setTimeout(function(){ this.setAnimation(google.maps.Animation.BOUNCE); }, 750);
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ marker.setAnimation(null); }, 1050);
                marker.setIcon('assets/img/map-marker.png');
                infoWindow.open(map, this);
            }
        });
    }
}
//init funtion for google maps API to call map and place on document
function initMap(center) {
    map = new google.maps.Map(document.getElementById('mapcanvas'), {
        center: {lat: center.latitude, lng: center.longitude},
        zoom: 12
    });
    //ensures ViewModel only runs when google maps call returns successful
    ko.applyBindings(ViewModel);
}
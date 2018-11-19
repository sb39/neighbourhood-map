var styles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#003b5d"
            },
            {
                "visibility": "on"
            }
        ]
    }
];


//locations data for markers to be shown on map
var locations = [{
    title: 'Moscow Kremlin', location: {lat:55.752023, lng: 37.617499},
        show: true,
        selected: false,
        
    },
    {
        title: 'Saint Basil\'s Cathedral', location: {lat: 55.752523, lng: 37.623087},
        show: true,
        selected: false,
    },
    {
        title: 'Bolshoi Theatre, Moscow', location: {lat: 55.760133, lng: 37.618649},
        show: true,
        selected: false,
        
    },
    {
        title: 'State Historical Museum', location: {lat:  55.755334, lng: 37.617847},
        show: true,
        selected: false,
        
    },
    {
        title: 'Sparrow Hills', location: {lat:  55.706165, lng: 37.536617},
        show: true,
        selected: false,
        
    },
    {
        title: 'Ostankino Tower', location: {lat: 55.819722, lng: 37.611667},
        show: true,
        selected: false,
        
    },
    {
        title: 'Museum of the Great Patriotic War', location: {lat:55.730932, lng: 37.505005},
        show: true,
        selected: false,
        
    },
    {
        title: 'Kuskovo', location: {lat:55.742674, lng: 37.788177},
        show: true,
        selected: false,
        
    },
    {
        title: 'Sokolniki Park', location: {lat: 55.795065, lng: 37.676581},
        show: true,
        selected: false,
        
    },
    {
        title: 'Aptekarsky Ogorod', location: {lat:  55.777973, lng: 37.633036},
        show: true,
        selected: false,
        
    }
];


var model = function()

{

    var self = this;

    self.errorDisplay = ko.observable('');
    self.locationArr = [];
    var largeInfowindow = new google.maps.InfoWindow();

    for (var i = 0; i < locations.length; i++) {
        var marker = new google.maps.Marker({
            position: {
                lat: locations[i].location.lat,
                lng: locations[i].location.lng
            },
            map: map,
            title: locations[i].title,
            show: ko.observable(locations[i].show),
            selected: ko.observable(locations[i].selected),
            // venueid: locations[i].venueId, // venue id used for foursquare
            animation: google.maps.Animation.DROP
        });
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
          });

        self.locationArr.push(marker);
        
    }

    //populate infowindow function
    function populateInfoWindow(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
          // Clear the infowindow content to give the streetview time to load.
          infowindow.setContent('');
          infowindow.marker = marker;
          // Make sure the marker property is cleared if the infowindow is closed.
          infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
          });
          var streetViewService = new google.maps.StreetViewService();
          var radius = 100;
          // In case the status is OK, which means the pano was found, compute the
          // position of the streetview image, then calculate the heading, then get a
          // panorama from that and set the options
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(
                nearStreetViewLocation, marker.position);
                infowindow.setContent('<div>' + marker.title + '</div><div id="pano"></div>');
                var panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 30
                  }
                };
              var panorama = new google.maps.StreetViewPanorama(
                document.getElementById('pano'), panoramaOptions);
            } else {
              infowindow.setContent('<div>' + marker.title + '</div>' +
                '<div>No Street View Found</div>');
            }
          }
          // Use streetview service to get the closest streetview image within
          // 50 meters of the markers position
          streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
          // Open the infowindow on the correct marker.
          infowindow.open(map, marker);
        }
      }

    // Bouce effect
    self.Bounce = function(marker) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 600);
    };

  

    // using knockout js observable for declaring searchtext
    self.searchText = ko.observable('');

   
    self.filterList = function() {
        var entry = self.searchText();
        infowindow.close();
        if (entry.length === 0) {
            self.setAllShow(true);
        } else {
            for (var i = 0; i < self.locationArr.length; i++) {
                if (self.locationArr[i].title.toLowerCase().indexOf(entry.toLowerCase()) > -1) {    //check
                    self.locationArr[i].show(true);
                    self.locationArr[i].setVisible(true);
                } else {
                    self.locationArr[i].show(false);
                    self.locationArr[i].setVisible(false);
                }
            }
        }
        infowindow.close();
    };
    
    // show all markers
    self.setAllShow = function(marker) {
        for (var i = 0; i < self.locationArr.length; i++) {
            self.locationArr[i].show(marker);
            self.locationArr[i].setVisible(marker);
        }
    };
    // unselect markers
    self.setAllUnselected = function() {
        for (var i = 0; i < self.locationArr.length; i++) {
            self.locationArr[i].selected(false);
        }
    };
    self.setSelected = function(location) {
        self.setAllUnselected();
        location.selected(true);
        populateInfoWindow(this, largeInfowindow);
        self.currentLocation = location;
        self.Bounce(location);
    };
};
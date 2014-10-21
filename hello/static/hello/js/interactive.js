// xml request object for async requests
var req; 
var geocoder = new google.maps.Geocoder();

// main map initializing function
function initialize(position) {

// initialize a map using position (and if html5 is supported)
	if (position==null) {
		var mapOptions = {
		  center: new google.maps.LatLng(-34.397, 150.644),
		  zoom: 3
		};
	} else {
		var mapOptions = {
		  center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
		  zoom: 3
		};
	}
	var map = new google.maps.Map(document.getElementById("map-canvas"),
	    mapOptions);


	$("div#gameInfo").each(function() {
		var venueName = $(this).children("#venueName")[0].innerHTML;
		var venueAddr = $(this).children("#venueAddress")[0].innerHTML;
		var homeTeam = $(this).children("#homeTeam")[0].innerHTML;
		var awayTeam = $(this).children("#awayTeam")[0].innerHTML;
		var gameId = $(this).children("#gameId")[0].innerHTML;
		var contentString = '<div class="bg-info"><h3>'+homeTeam+'</h3> vs <h3>'+awayTeam + '</h3></div>' + '<br><div class="bg-info"> Venue: ' + venueName +'</div>';
		var linkToFollowPage = '<br><a class="text-primary" href="/gameTime/game-page/' + gameId +'/commentary">FollowGame</a>';
		// linkToFollowPage = '<br><a class="text-primary" href="www.google.com"' + '">FollowGame</a>';
		contentString = contentString + linkToFollowPage;
		placeLabel(venueAddr, map, contentString);
	});
	
}
function placeLabel(addressString,mainMap,contentString) {
	console.log("parsing addressString "+addressString);
	// geocoder to translate addresses to Lat/Lng
	geocoder.geocode({'address': addressString}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
		var thumbTag = new google.maps.Marker({
			map: mainMap,
			position: results[0].geometry.location,
			animation: google.maps.Animation.DROP,
			// icon: $("img#displayPhoto").attr("src")
			// icon: DISPLAY_PHOTO_URL,
			// icon: '/Users/matthewtay/Web/team19/gameTime/gameTime/media/game-photos/fence.jpg',
			// icon: '/gameTime/getPhoto/fence'
			// icon: '/Users/matthewtay/Web/team19/gameTime/gameTime/media/game-photos/fence.jpg'

		});
		var infoWindow = new google.maps.InfoWindow({
			content: contentString
		});
		// open infoWindow when thumbTag is clicked
		google.maps.event.addListener(thumbTag,'click',function() {
			if (infoWindow.getMap()!=null && typeof infoWindow.getMap() != "undefined"){
				infoWindow.close();
			} else {
				infoWindow.open(mainMap,thumbTag);
			}
		})
		} else {
			console.log("could not find "+ addressString);
		}
	});
}


function getUsrLocation() {
	if (navigator.geolocation) {
    	navigator.geolocation.getCurrentPosition(initialize);
    } else {
    	// browser does not support html5
    	initialize(null);
    }
}
google.maps.event.addDomListener(window, 'load', getUsrLocation);

// window.setInterval(sendRequest,1000);

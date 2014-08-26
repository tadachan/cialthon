//<script type="text/javascript" src="http://wisteriahill.sakura.ne.jp/GMAP/googlemaps_template/streetview.js"></script>

var panorama;
var panoramaOptions;
var panorama_heading;
var panorama_pitch;
var panorama_position;
var panorama_pano;
var panorama_links;


//--------------------------------------------------------
function set_svStreet(){
	//StreetViewの青い経路
	street = new google.maps.ImageMapType({
       getTileUrl: function(coord, zoom) {
          var X = coord.x % (1 << zoom);
          return "http://cbk0.google.com/cbk?output=overlay&zoom=" + zoom + "&x=" + X + "&y=" + coord.y + "&cb_client=api";
       },
       tileSize: new google.maps.Size(256, 256),
       isPng: true,
       visible:false,
       opacity: 0.8
    });
    googlemap.overlayMapTypes.push(street);
	
}

function init_innerStreetview(lat,lng) {
	
	//sreetviewを内部で使う
	 panoramaOptions = {
	  position: new google.maps.LatLng(lat,lng),
	  
	  addressControlOptions: {
	    position: google.maps.ControlPosition.BOTTOM
	  },
  	  
  	  linksControl: true,
  	  panControl: false,
  	  zoomControlOptions: {
	    style: google.maps.ZoomControlStyle.LARGE
	  },
  	  enableCloseButton: true,
  	  
	  pov: {
	    heading: 34,
	    pitch: 10,
	    zoom: 1
	  }
	};
	
	panorama = googlemap.getStreetView();
	
	google.maps.event.addListener(panorama, 'pano_changed', function() {
		//渡された LatLng と検索対象の半径（メートル単位）を受け取り、指定された領域のパノラマ データを検索します。
		//半径が 50 m 以下の場合、返されるパノラマは指定された位置に最も近いパノラマになります。
		panorama_pano = panorama.getPano();
		
		
		var sv = new google.maps.StreetViewService();
		sv.getPanoramaByLocation(new google.maps.LatLng(lat,lng), 50, processSVData);
		
		sv_pano_changed();
		
	});
	
	google.maps.event.addListener(panorama, 'position_changed', function() {
	      //
	      panorama_position = panorama.getPosition();
	      
	      sv_position_changed();
	});
	
	google.maps.event.addListener(panorama, 'pov_changed', function() {
		
	      panorama_heading = panorama.getPov().heading;
	      panorama_pitch = panorama.getPov().pitch;
	      
	      sv_pov_changed();
	});
  	
  	
  	google.maps.event.addListener(panorama, 'links_changed', function() {
		
		var links =  panorama.getLinks();
		for (var i in links) {
			var hText = "Link: " + i + "";
			var vText = links[i].description;
			panorama_links += hText + "&" + vText + "/";
		}
		
		sv_links_changed();
  	});
  	
	
}

function init_outerStreetview(lat,lng) {
	
	//sreetviewを外部で使う
	 panoramaOptions = {
	  position: new google.maps.LatLng(lat,lng),
	  
	  addressControlOptions: {
	    position: google.maps.ControlPosition.BOTTOM
	  },
	  		
  	  linksControl: true,
  	  panControl: true,
  	  zoomControlOptions: {
	    style: google.maps.ZoomControlStyle.SMALL
	  },
  	  enableCloseButton: false,
  	  
	  pov: {
	    heading: 34,
	    pitch: 10,
	    zoom: 1
	  }
	};
	
	
	//StreetViewPanoramaをDOM要素に表示することで、Maps内のStreetViewを外に出す
	panorama = new  google.maps.StreetViewPanorama(document.getElementById("streetview"), panoramaOptions);
	
	google.maps.event.addListener(panorama, 'pano_changed', function() {
		//渡された LatLng と検索対象の半径（メートル単位）を受け取り、指定された領域のパノラマ データを検索します。
		//半径が 50 m 以下の場合、返されるパノラマは指定された位置に最も近いパノラマになります。
		panorama_pano = panorama.getPano();
		
		
		var sv = new google.maps.StreetViewService();
		sv.getPanoramaByLocation(new google.maps.LatLng(lat,lng), 50, processSVData);
		
		sv_pano_changed();
		
	});
	
	google.maps.event.addListener(panorama, 'position_changed', function() {
	      //
	      panorama_position = panorama.getPosition();
	      
	      sv_position_changed();
	});
	
	google.maps.event.addListener(panorama, 'pov_changed', function() {
		
	      panorama_heading = panorama.getPov().heading;
	      panorama_pitch = panorama.getPov().pitch;
	      
	      sv_pov_changed();
	});
  	
  	
  	google.maps.event.addListener(panorama, 'links_changed', function() {
		
		var links =  panorama.getLinks();
		for (var i in links) {
			
			var hText = "Link: " + i + "";
			var vText = links[i].description;
			panorama_links += hText + "&" + vText + "/";
		}
		
		sv_links_changed();
  	});
  	
  	
	googlemap.setStreetView(panorama);
	
}

function processSVData(data, status) {
	
	if (status == google.maps.StreetViewStatus.OK) {
		//document.getElementById("svloc").value = data.location.latLng.lat() + "," + data.location.latLng.lng();
		/*
		var MarkerImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_icon&chld=dollar|FFFF00');
		var marker = new google.maps.Marker({
			position: data.location.latLng,
			map: googlemap,
			icon:MarkerImage,
			title: data.location.description
		
		});
	*/
	/*
		google.maps.event.addListener(marker, 'click', function() {
			var markerPanoID = data.location.pano;
			// Set the Pano to use the passed panoID
			panorama.setPano(markerPanoID);
			panorama.setPov({
				heading: 270,
				pitch: 0,
				zoom: 1
			});
			panorama.setVisible(true);
		
		});
	
	
	*/
	}else{
		//document.getElementById("stat").value = "streetview:no";
		
		
	}
	
	if (status == google.maps.StreetViewStatus.ZERO_RESULTS) {
		//渡された条件と一致するパノラマをサービスが見つけられなかった
		//document.getElementById("stat").value = "streetview:notfined";
		//document.getElementById("svloc").value = "";
	}
	
	if (status == google.maps.StreetViewStatus.UNKNOWN_ERROR) {
		//ストリートビュー リクエストを処理できず、正確な理由が不明
		//document.getElementById("stat").value = "streetview:unknown";
		//document.getElementById("svloc").value = "";
	}
	
}





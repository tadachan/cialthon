//<script type="text/javascript" src="http://wisteriahill.sakura.ne.jp/GMAP/googlemaps_template/googlemaps.js"></script>

var googlemap,mapOpt, geocoder,street,elevator;
var v_line,h_line;
var map_center;
//Marker
var markersArray = [];
//Symbol
var symbolsArray = [];
//Polyline
var polylinesArray = [];
var polyline;
//Symbol Animatiom
var animationlinesArray = [];
//var animationline;
//Polygon
var polygonsArray = [];
//
var customoverlay;
USGSOverlay.prototype = new google.maps.OverlayView();
//
var reverse_address = "";

//インフォウインドウの記憶用変数	tada
var OpenInfoWindow = [];


function init_map() {
	
	mapOpt = { 
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: new google.maps.LatLng(ini_lat,ini_lng),
		streetViewControl:true,
		zoom: ini_zoom
	};
	
	googlemap = new google.maps.Map(document.getElementById("map_canvas"), mapOpt);
	
	//ジオコード
	geocoder = new google.maps.Geocoder();
	
	// Create an ElevationService 
	elevator = new google.maps.ElevationService();
	
	
	//イベント
	google.maps.event.addListener(googlemap, 'click',gmap_click);
	google.maps.event.addListener(googlemap, 'dblclick',gmap_dblclick);
	google.maps.event.addListener(googlemap, 'rightclick',gmap_rightclick);
	google.maps.event.addListener(googlemap, 'drag',gmap_drag);
	google.maps.event.addListener(googlemap, 'dragend',gmap_dragend);
	google.maps.event.addListener(googlemap, 'mouseup',gmap_mouseup);
	google.maps.event.addListener(googlemap, 'mousedown',gmap_mousedown);
	google.maps.event.addListener(googlemap, 'mouseout',gmap_mouseout);
	google.maps.event.addListener(googlemap, 'mouseover',gmap_mouseover);
	google.maps.event.addListener(googlemap, 'mousemove',gmap_mousemove);
	google.maps.event.addListener(googlemap, 'bounds_changed',gmap_bounds_changed);
    google.maps.event.addListener(googlemap, 'zoom_changed',gmap_zoom_changed);
    google.maps.event.addListener(googlemap, 'center_changed',gmap_center_changed);
    google.maps.event.addListener(googlemap, 'maptypeid_changed',gmap_maptypeid_changed);
	
	//クロスラインオーバーレイ生成
	map_center = googlemap.getCenter();
    v_line = new overlay_A("vertical_line", map_center.lat(), map_center.lng());
    h_line = new overlay_A("horizontal_line", map_center.lat(), map_center.lng());
    
	
	//
	gmap_init();
}



//-------------------------------------------------------
//オーバーレイ user定義
function overlay_A(name, lat, lng) {
	this.name_ = name;
	this.lat_ = lat;
	this.lng_ = lng;
	this.setMap(googlemap);
}


//オーバーレイ
overlay_A.prototype = new google.maps.OverlayView();


overlay_A.prototype.draw = function() {
	//何度も呼ばれる可能性があるので、div_が未設定の場合のみ要素生成
	if (!this.div_) {
		//出力したい要素生成
		this.div_ = document.createElement("div");
		this.div_.style.position = "absolute";
		this.div_.style.fontSize = "200%";
		
		if (this.name_ == "vertical_line") {
			var img = '<img src="images/vert_line.jpg">';
		}else if (this.name_ == "horizontal_line") {
			var img = '<img src="images/hori_line.jpg">';
		}
		
		
		this.div_.innerHTML = img;
		
		
		//要素を追加するチャイルドを取得して、追加
		var panes = this.getPanes();
		panes.overlayLayer.appendChild(this.div_);
		
	}
	
	
	
	//
	//緯度・軽度を、ピクセル値(google.maps.Point）に変換
	var lefttop = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(this.lat_, this.lng_));
	
	// 取得したピクセル値で、要素の位置を設定
	//shift
	if (this.name_ == "vertical_line") {
		var top_pos = lefttop.y - 20;
		var left_pos = lefttop.x;
	}else if (this.name_ == "horizontal_line") {
		//HTML5 対策
		//var top_pos = lefttop.y;
		var top_pos = lefttop.y - 22;

		var left_pos = lefttop.x - 20;
	}
	
	this.div_.style.left = left_pos + 'px';
	this.div_.style.top = top_pos + 'px';
}

//削除処理の実装 
overlay_A.prototype.remove = function() {
	if (this.div_) {
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	}
}


overlay_A.prototype.setPosition = function(lat, lng) {
	this.lat_ = lat;
	this.lng_ = lng;
	//緯度・軽度を、ピクセル値(google.maps.Point）に変換
	var lefttop = this.getProjection().fromLatLngToDivPixel(new google.maps.LatLng(this.lat_, this.lng_));
	
	// 取得したピクセル値で、要素の位置を設定
	//shift
	if (this.name_ == "vertical_line") {
		var top_pos = lefttop.y - 20;
		var left_pos = lefttop.x;
	}else if (this.name_ == "horizontal_line") {
		//HTML5対策
		//var top_pos = lefttop.y;
		var top_pos = lefttop.y - 22;

		var left_pos = lefttop.x - 20;
	}
	
	this.div_.style.left = left_pos + 'px';
	this.div_.style.top = top_pos + 'px';
}

//----------------------------------------------------------------------
//マーカー

function addMarker(index,lat,lng,image,size,title,draggable,visible,anim){
	
	//アイコンの作成
	 var marker_image = new google.maps.MarkerImage(image,
	// イメージサイズ
	new google.maps.Size(size, size),
	// アイコンの起点
	new google.maps.Point(0,0),
	// デフォルトの先がとがったアイコンでない場合は、画像の中心がよいと思います。
	new google.maps.Point(size/2, size/2));
	
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat,lng),
		map: googlemap,
		//shadow: marker_shadow,
		icon: marker_image,
		animation:anim,
		//shape: marker_shape,
		title:title,
		index:index,
		visible:visible,
		draggable : draggable
		//zIndex: 1
	});
	
	google.maps.event.addListener(marker, "click", function() {
		marker_click(this);
	 
	});
	
	google.maps.event.addListener(marker, "dragend", function() {
		marker_dragend(this);
	 
	});

	markersArray.push(marker);
}

function clearAllMarkers(){
	if (markersArray) {
		for (i in markersArray) {
			markersArray[i].setMap(null);
		}
	}
}

function clearMarker(index){
	if (markersArray) {
		markersArray[index].setMap(null);
	}
}

function showAllMarkers(){
	if (markersArray) {
		for (i in markersArray) {
			markersArray[i].setMap(googlemap);
		}
	}
}

function showMarker(index){
	if (markersArray) {
		markersArray[index].setMap(googlemap);
	}
}

function deleteAllMarkers() {
  if (markersArray) {
    for (i in markersArray) {
      markersArray[i].setMap(null);
    }
    markersArray.length = 0;
  }
}

//----------------------------------------------------------------------
//マーカーにインフォウィンドウ
//インフォウインドウの記憶用変数	tada
//var OpenInfoWindow = [];	topで宣言　tada

function marker_infoWindow(markerIndex,htmlStrings){
	var infowindow = new google.maps.InfoWindow({
		 content:htmlStrings,
		 //maxWidth: 20px,
		 //pixelOffset:new google.maps.Size(0,20)
	});
	
	infowindow.open(googlemap, markersArray[markerIndex]);
	
	//インフォウインドウの記憶		tada
	OpenInfoWindow[markerIndex] = infowindow;	
}

//----------------------------------------------------------------------
//シンボル(矢印・円・ベクトル図形）
function addSymbol(index,type,fillcolor,strokecolor,opacity,scale,angle,weight,lat,lng,draggable){
	var symbol_path;
	
	if (type == "star"){
		symbol_path = 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z';
	}else if (type == "circle"){
		symbol_path = google.maps.SymbolPath.CIRCLE;
	}else if (type == "arrow_cb"){//すべての側面が閉じている後ろ向きの矢印
		symbol_path = google.maps.SymbolPath.BACKWARD_CLOSED_ARROW;
	}else if (type == "arrow_cf"){//すべての側面が閉じている前向きの矢印
		symbol_path = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
	}else if (type == "arrow_ob"){//1 つの側面が開いている後ろ向きの矢印
		symbol_path = google.maps.SymbolPath.BACKWARD_OPEN_ARROW;
	}else if (type == "arrow_of"){//1 つの側面が開いている前向きの矢印
		symbol_path = google.maps.SymbolPath.FORWARD_OPEN_ARROW;
	}
	
	var symbol_icon = {
		path:symbol_path,
		fillColor:fillcolor,
		fillOpacity:opacity,
		rotation:angle,
		scale:scale,
		strokeColor:strokecolor,
		strokeWeight:weight
		
	};
	
	
	var symbol = new google.maps.Marker({
		position: new google.maps.LatLng(lat,lng),
		icon: symbol_icon,
		map: googlemap,
		index:index,
		draggable:draggable
	});
	
	google.maps.event.addListener(symbol, "click", function() {
		symbol_click(symbol.index);
	 
	});
	
	google.maps.event.addListener(symbol, "dragend", function() {
		symbol_dragend(symbol.index);
	 
	});
	
	symbolsArray.push(symbol);
}

function clearAllSymbols(){
	if (symbolsArray) {
		for (i in symbolsArray) {
			symbolsArray[i].setMap(null);
		}
	}
}

function clearSymbol(index){
	if (symbolsArray) {
		symbolsArray[index].setMap(null);
	}
}

function showAllSymbols(){
	if (symbolsArray) {
		for (i in symbolsArray) {
			symbolsArray[i].setMap(googlemap);
		}
	}
}

function showSymbol(index){
	if (symbolsArray) {
		symbolsArray[index].setMap(googlemap);
	}
}

function deleteAllSymbols() {
  if (symbolsArray) {
    for (i in symbolsArray) {
      symbolsArray[i].setMap(null);
    }
    symbolsArray.length = 0;
  }
}

//----------------------------------------------------------------------
//Elevetion 標高
function get_hyokou(latlng) {
	
	var locations = []; 
	
	locations.push(latlng); 
	
	// Create a LocationElevationRequest object using the array's one value 
	var positionalRequest = { 
		'locations': locations 
	} 
	
	// Initiate the location request 
	elevator.getElevationForLocations(positionalRequest, function(results, status) { 
		if (status == google.maps.ElevationStatus.OK) { 
		
			// Retrieve the first result 
			if (results[0]) { 
				
				// Open an info window indicating the elevation at the clicked position 
				//alert(results[0].elevation + " meters.");
				//document.getElementById("altitude").value = results[0].elevation + " m";
				result_hyokou(results[0].elevation);
			} else { 
				//alert("データがありませんでした");
				result_hyokou("no");
			} 
		} else { 
			//alert("標高検出に失敗: " + status);
			result_hyokou("no");
		} 
	}); 
}

//---------------------------------------------------------
function geoCode(address){
	
	if (address != ""){
	    if (geocoder) {
	      geocoder.geocode( { 'address': address}, function(results, status) {
	        if (status == google.maps.GeocoderStatus.OK) {
	        	map_center = results[0].geometry.location;
	          	googlemap.setCenter(map_center);
				
	          	v_line.setPosition(map_center.lat(),map_center.lng());
    			h_line.setPosition(map_center.lat(),map_center.lng());
    			
    			//markersArray[0].setPosition(map_center);
    			result_geoCode(map_center);
    			
	          	
	        } else {
	        	result_geoCode(status);
	          	//alert("Geocode was not successful for the following reason: " + status);
	          	
	        }
	      });
	    }
	}
}

function reverse_geoCode(ido,keido) {
	var lat = parseFloat(ido); 
	var lng = parseFloat(keido); 
	var latlng = new google.maps.LatLng(lat, lng); 
	geocoder.geocode({'latLng': latlng}, function(results, status) {
		
		if (status == google.maps.GeocoderStatus.OK) {
			
			if (results[1]) {
				reverse_address = results[1].formatted_address;
				//alert(results[1].formatted_address);
				result_reverseGeocode(reverse_address);
				
			} 
		} else {
			
			//alert("Geocoder failed due to: " + status);
			result_reverseGeocode(status);
		} 
	}); 
}


//----------------------------------------------------------------------
//ポリライン
function addPolyline(index,title,coordinatesArray,color,opacity,weight,editable,draggable){
	polyline = new google.maps.Polyline({
		path: coordinatesArray,
		strokeColor:color,
		strokeOpacity:opacity,
		strokeWeight:weight,
		editable:editable,
		draggable:draggable,
		index:index,
		title:title
	});
	
	polyline.setMap(googlemap);
	//
	polylinesArray.push(polyline);
	//
	google.maps.event.addListener(polyline, "click", function() {
	 	//
	 	polyline_click();
	});
	
	google.maps.event.addListener(polyline, "dblclick", function() {
		//
		polyline_dblclick();
	});
	
	google.maps.event.addListener(polyline, "rightclick", function() {
		//
		polyline_rightclick();
	});
	
	google.maps.event.addListener(polyline, "mousedown", function() {
		//
		polyline_mousedown();
	});
	
	google.maps.event.addListener(polyline, "mouseup", function() {
		//
		polyline_mouseup();
	});
	
	google.maps.event.addListener(polyline, "mouseover", function() {
		//
		polyline_mouseover();
	});
	
	google.maps.event.addListener(polyline, "mouseout", function() {
		//
		polyline_mouseout();
	});
	
	google.maps.event.addListener(polyline, "dragend", function() {
		//
		polyline_dragend();
	});
	
	//編集
	google.maps.event.addListener(polyline.getPath(), 'insert_at', function() {
	  //
	  polyline_insert_at();
	});
	
	google.maps.event.addListener(polyline.getPath(), 'remove_at', function() {
	  //
	  polyline_remove_at();
	});
	
	google.maps.event.addListener(polyline.getPath(), 'set_at', function() {
	  //
	  polyline_set_at();
	});
	
	
	
	
}


function deleteAllPolylines(){
	if (polylinesArray) {
	    for (i in polylinesArray) {
	      polylinesArray[i].setMap(null);
	    }
	    polylinesArray.length = 0;
	}
}

//ポリライン-矢印
function addArrowline(index,title,type,coordinatesArray,color,opacity,weight,editable,draggable){
	
	var headArrow = {
		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
	};
	var tailArrow = {
		path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW
	};
	
	if (type == "both"){
		var arrowsArray = [{
			icon: headArrow,
			offset: '100%'
		},
		{
			icon: tailArrow,
			offset: '0%'
		}
		];
	}else if (type == "head"){
		var arrowsArray = [{
			icon: headArrow,
			offset: '100%'
		}];
	}else if (type == "tail"){
		var arrowsArray = [{
			icon: tailArrow,
			offset: '0%'
		}];
	}
	
	
	
	var arrowline = new google.maps.Polyline({
		path: coordinatesArray,
		icons:arrowsArray,
		strokeColor:color,
		strokeOpacity:opacity,
		strokeWeight:weight,
		editable:editable,
		draggable:draggable,
		index:index,
		title:title,
		map:googlemap
	});
	
	//
	google.maps.event.addListener(arrowline, "click", function() {
	 	//
	 	arrowline_click();
	 	
	});
	
	google.maps.event.addListener(arrowline, "dblclick", function() {
		//
		arrowline_dblclick();
	});
	
	google.maps.event.addListener(arrowline, "rightclick", function() {
		//
		arrowline_rightclick();
	});
	
	google.maps.event.addListener(arrowline, "mousedown", function() {
		//
		arrowline_mousedown();
	});
	
	google.maps.event.addListener(arrowline, "mouseup", function() {
		//
		arrowline_mouseup();
	});
	
	google.maps.event.addListener(arrowline, "mouseover", function() {
		//
		arrowline_mouseover();
	});
	
	google.maps.event.addListener(arrowline, "mouseout", function() {
		//
		arrowline_mouseout();
	});
	//編集
	google.maps.event.addListener(arrowline.getPath(), 'insert_at', function() {
	  //
	  arrowline_insert_at();
	});
	
	google.maps.event.addListener(arrowline.getPath(), 'remove_at', function() {
	  //
	  arrowline_remove_at();
	});
	
	google.maps.event.addListener(arrowline.getPath(), 'set_at', function() {
	  //
	  arrowline_set_at();
	});
	
	//
	polylinesArray.push(arrowline);
}

//ポリライン-点線
function addDotline(index,title,coordinatesArray,color,opacity,weight,editable,draggable){
	var lineSymbol = {
		path: 'M 0,-1 0,1',
		strokeOpacity:opacity,
		scale: 4
	};

	var dotline = new google.maps.Polyline({
		path: coordinatesArray,
		strokeOpacity: 0,
		icons: [{
		icon: lineSymbol,
		offset: '0',
		repeat: '20px'
		}],
		strokeColor:color,
		strokeOpacity:0,//元の線を隠す
		strokeWeight:weight,
		editable:editable,
		draggable:draggable,
		index:index,
		title:title,
		map:googlemap
	});
	
	//
	google.maps.event.addListener(dotline, "click", function() {
	 	//
	 	dotline_click();
	});
	
	google.maps.event.addListener(dotline, "dblclick", function() {
		//
		dotline_dblclick();
	});
	
	google.maps.event.addListener(dotline, "rightclick", function() {
		//
		dotline_rightclick();
	});
	
	google.maps.event.addListener(dotline, "mousedown", function() {
		//
		dotline_mousedown();
	});
	
	google.maps.event.addListener(dotline, "mouseup", function() {
		//
		dotline_mouseup();
	});
	
	google.maps.event.addListener(dotline, "mouseover", function() {
		//
		dotline_mouseover();
	});
	
	google.maps.event.addListener(dotline, "mouseout", function() {
		//
		dotline_mouseout();
	});
	//編集
	google.maps.event.addListener(dotline.getPath(), 'insert_at', function() {
	  //
	  dotline_insert_at();
	});
	
	google.maps.event.addListener(dotline.getPath(), 'remove_at', function() {
	  //
	  dotline_remove_at();
	});
	
	google.maps.event.addListener(dotline.getPath(), 'set_at', function() {
	  //
	  dotline_set_at();
	});
	//
	polylinesArray.push(dotline);
}

//----------------------------------------------------------------------
//ラインに沿ってシンボルをアニメーション-①②はセット
//①
function addSymbolanimation(symbol,coordinatesArray,symbolcolor,linecolor,title,editable,draggable){
	var lineSymbol = {
		path:symbol,
		scale:4,
		fillColor:symbolcolor,
		fillOpacity:1,
		strokeOpacity:1,
		strokeColor:symbolcolor
	};
	
	
	var lineopacity;
	if (editable == true){
		lineopacity = 1;//経路が不透明
	}else{
		lineopacity = 0;//経路が透明
	}
	
	var animline = new google.maps.Polyline({
		path: coordinatesArray,
		icons: [{
		  icon: lineSymbol,
		  offset: '100%'
		}],
		strokeOpacity:lineopacity,
		strokeColor:linecolor,
		editable:editable,
		draggable:draggable,
		title:title,
		map:googlemap
	});
	
	//
	google.maps.event.addListener(animline, "click", function() {
	 	//
	 	animline_click();
	});
	
	google.maps.event.addListener(animline, "dblclick", function() {
		//
		animline_dblclick();
	});
	
	google.maps.event.addListener(animline, "rightclick", function() {
		//
		animline_rightclick();
	});
	
	google.maps.event.addListener(animline, "mousedown", function() {
		//
		animline_mousedown();
	});
	
	google.maps.event.addListener(animline, "mouseup", function() {
		//
		animline_mouseup();
	});
	
	google.maps.event.addListener(animline, "mouseover", function() {
		//
		animline_mouseover();
	});
	
	google.maps.event.addListener(animline, "mouseout", function() {
		//
		animline_mouseout();
	});
	//編集
	google.maps.event.addListener(animline.getPath(), 'insert_at', function() {
	  //
	  animline_insert_at();
	});
	
	google.maps.event.addListener(animline.getPath(), 'remove_at', function() {
	  //
	  animline_remove_at();
	});
	
	google.maps.event.addListener(animline.getPath(), 'set_at', function() {
	  //
	  animline_set_at();
	});
	//
	
	animationlinesArray.push(animline);
}
//②
function animateSymbol(index) {
	var count = 0;
	offsetId = window.setInterval(function() {
	count = (count + 1) % 200;
	
	var icons = animationlinesArray[index].get('icons');
	icons[0].offset = (count / 2) + '%';
	animationlinesArray[index].set('icons', icons);
	}, 20);
	
}

//経路を編集
function symbolanim_editable(index,type){
	
	if (type == true){
		animationlinesArray[index].strokeOpacity = 1;
		animationlinesArray[index].setEditable(true);
	} else{
		animationlinesArray[index].strokeOpacity = 0;
		animationlinesArray[index].setEditable(false);
	}
	
}



//----------------------------------------------------------------------
//ポリゴン
function addPolygon(index,title,coordinatesArray,strokecolor,strokeopacity,weight,fillcolor,fillopacity,editable,draggable){

	polygon = new google.maps.Polygon({
		paths: coordinatesArray,
		strokeColor:strokecolor,
		strokeOpacity:strokeopacity,
		strokeWeight:weight,
		fillColor:fillcolor,
		fillOpacity:fillopacity,
		editable:editable,
		draggable:draggable,
		index:index,
		title:title
	});
	//
	
	polygon.setMap(googlemap);
	//

	//****** polygonsArray 本スクリプトでは0しか使用していないので下方を使用 2014.8.4 tada
	//polygonsArray.push(polygon);
	polygonsArray[index] = polygon;
	//******

	//
	google.maps.event.addListener(polygon, 'click', polygon_click);
	
	//編集
	google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
	  //
	  polygon_insert_at();
	});
	
	google.maps.event.addListener(polygon.getPath(), 'remove_at', function() {
	  //
	  polygon_remove_at();
	});
	
	google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
	  //
	  polygon_set_at();
	});
	
}



function addCirclepolygon(index,title,center,radius,strokecolor,strokeopacity,weight,fillcolor,fillopacity,editable,draggable){
	var circleOptions = {
		strokeColor:strokecolor,
		strokeOpacity:strokeopacity,
		strokeWeight:weight,
		fillColor:fillcolor,
		fillOpacity:fillopacity,
		map:googlemap,
		center:center,
		radius:radius,//単位ｍ
		editable:editable,
		draggable:draggable,
		index:index,
		title:title
	};
	
	var CirclePolygon = new google.maps.Circle(circleOptions);
	
	polygonsArray.push(CirclePolygon);
	//
	google.maps.event.addListener(CirclePolygon, 'click', circlerect_click);
	
	//編集
	google.maps.event.addListener(CirclePolygon, 'radius_changed', function() {
	  //
	  var radius = CirclePolygon.getRadius();
	  CirclePolygon_radius_changed(radius);
	});
	
	google.maps.event.addListener(CirclePolygon, 'center_changed', function() {
	  //
	  var center = CirclePolygon.getCenter();
	  CirclePolygon_center_changed(center);
	});
	
	
}

function addRectpolygon(index,title,bounds,strokecolor,strokeopacity,weight,fillcolor,fillopacity,editable,draggable){
	var RectPolygon = new google.maps.Rectangle();
	
	var rectOptions = {
		strokeColor:strokecolor,
		strokeOpacity:strokeopacity,
		strokeWeight:weight,
		fillColor:fillcolor,
		fillOpacity:fillopacity,
		map:googlemap,
		bounds:bounds,
		editable:editable,
		draggable:draggable,
		index:index,
		title:title
	};
	
    RectPolygon.setOptions(rectOptions);
	
	polygonsArray.push(RectPolygon);
	//
	google.maps.event.addListener(RectPolygon, 'click', circlerect_click);
	//編集
	google.maps.event.addListener(RectPolygon, 'bounds_changed', function() {
	  	//
	  	var ne = RectPolygon.getBounds().getNorthEast();
  		var sw = RectPolygon.getBounds().getSouthWest();
  		
	  	RectPolygon_bounds_changed(sw,ne);
	});
}



//ポリゴンにインフォウィンドウ
function polygon_infoWindow(polygonIndex,htmlStrings,position){
	var infowindow = new google.maps.InfoWindow({
		 content:htmlStrings
	});
	infowindow.setPosition(position);
	infowindow.open(googlemap);
	
	
}

//----------------------------------------------------------------------
//描画ライブラリ
function init_drwaing(){
	var drawingManager = new google.maps.drawing.DrawingManager({
	drawingMode: google.maps.drawing.OverlayType.MARKER,
	drawingControl: true,
	drawingControlOptions: {
		position: google.maps.ControlPosition.TOP_CENTER,
			drawingModes: [
			google.maps.drawing.OverlayType.MARKER,
			google.maps.drawing.OverlayType.CIRCLE,
			google.maps.drawing.OverlayType.POLYGON,
			google.maps.drawing.OverlayType.POLYLINE,
			google.maps.drawing.OverlayType.RECTANGLE
			]
			},
			markerOptions: {
			icon: 'images/blue1.png'
			},
			circleOptions: {
			fillColor: '#ffff00',
			fillOpacity: 1,
			strokeWeight: 5,
			clickable: false,
			editable: true,
			zIndex: 1
		}
	});
	drawingManager.setMap(googlemap);
	
	google.maps.event.addListener(drawingManager, 'circlecomplete', function(circle) {
	  var radius = circle.getRadius();
	  alert(radius);
	});
	
	
	
	google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
	  if (event.type == google.maps.drawing.OverlayType.CIRCLE) {
	    var radius = event.overlay.getRadius();
	    alert(radius);
	  }
	  
	  
	});
	
	
}

//ライブラリの更新
function mod_drawing(){
	drawingManager.setOptions({
		drawingControlOptions: {
		position: google.maps.ControlPosition.BOTTOM_LEFT,
		drawingModes: [google.maps.drawing.OverlayType.MARKER]
		}
	});
}

//ライブラリを隠す
function hide_drawing(){
	drawingManager.setOptions({
		drawingControl: false
	});
}

//ライブラリを出す
function show_drawing(){
	drawingManager.setOptions({
		drawingControl: true
	});
}

//ライブラリを削除
function delete_drawing(){
	drawingManager.setMap(null);
}

//----------------------------------------------------------------------
//ルート検索
var DirecFlg = false;
var directionsService = new google.maps.DirectionsService();

//option
var directionsDisplay = new google.maps.DirectionsRenderer(
	{
		map:googlemap,
		//panel: document.getElementById("directions_panel"),
		draggable:true	//ルートをドラッグで変更可能
	}
    );

function route_search(from,via,to,travel_mode){

	//すでに表示している場合
	if(DirecFlg){
		directionsDisplay.setMap(null);
		DirecFlg = false;
	}


	var optimizewaypoints_flag;
	if (via.length == 0){
		optimizewaypoints_flag = false;
	} else{
		optimizewaypoints_flag = true;
	}
	
	//var directionsService = new google.maps.DirectionsService();
	//var directionsDisplay = new google.maps.DirectionsRenderer();
	
	directionsDisplay.setMap(googlemap);
	DirecFlg = true;

	//ルート情報を表示
	directionsDisplay.setPanel(document.getElementById("directions_panel"));
	
	directionsService.route({
		/*
		origin : "新宿駅",
 		waypoints: [ { location: "鈴鹿駅" }, { location :"名古屋駅" } ],
 		optimizeWaypoints: true,
 		destination: "塩尻駅",
		
		*/
		
		
		origin :from,
		
 	 	waypoints:via,
 		optimizeWaypoints:optimizewaypoints_flag,
 		
		destination:to,
		
		
		avoidHighways:true,//高速道路を可能な限りルートの計算から除外する
		avoidTolls:true,//有料道路を可能な限りルートの計算から除外する
				
		travelMode:travel_mode//
		
		},function(response, status){
		if (status == google.maps.DirectionsStatus.OK) {

			directionsDisplay.setDirections(response);
			
			route_info(response);

			
		}else{
			
			if (status == google.maps.DirectionsStatus.INVALID_REQUEST){
				alert("検索失敗:リクエスト無効");
			}else if (status == google.maps.DirectionsStatus.MAX_WAYPOINTS_EXCEEDED){
				alert("検索失敗:ウェイポイント（経由地点）が8を超えました");
			}else if (status == google.maps.DirectionsStatus.NOT_FOUND){
				alert("検索失敗:出発地か到着地のジオコード取得に失敗しました");
			}else if (status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT){
				alert("検索失敗:リクエストの制限回数を超えました");
			}else if (status == google.maps.DirectionsStatus.REQUEST_DENIED){
				alert("検索失敗:ルート検索は使えません");
			}else if (status == google.maps.DirectionsStatus.ZERO_RESULTS){
				alert("検索失敗:ルートが見つかりませんでした");
			}else if (status == google.maps.DirectionsStatus.UNKNOWN_ERROR){
				alert("検索失敗:サーバーエラー/リトライすれば成功する可能性があります");
			}
			
			//alert("検索失敗");
			
		}
	});
}





//----------------------------------------------------------------------
//グラウンド オーバーレイ
function addGroundOverlay(sw_lat,sw_lng,ne_lat,ne_lng,image){
	
	var southWest = new google.maps.LatLng(sw_lat,sw_lng);
	var northEast = new google.maps.LatLng(ne_lat,ne_lng);
	
	var imageBounds = new google.maps.LatLngBounds(southWest,northEast);
    
	var g_overlay = new google.maps.GroundOverlay(image,imageBounds);
	
	g_overlay.setMap(googlemap);
	
}

//----------------------------------------------------------------------
//カスタム　オーバーレイ
function addCustomOverlay(swBound,neBound,srcImage){
	
	
	var bounds = new google.maps.LatLngBounds(swBound, neBound);
	
	// Photograph courtesy of the U.S. Geological Survey
	
	customoverlay = new USGSOverlay(bounds, srcImage, googlemap);
	
}

function USGSOverlay(bounds, image, map) {
	
	// Now initialize all properties.
	this.bounds_ = bounds;
	this.image_ = image;
	this.map_ = map;
	
	// We define a property to hold the image's
	// div. We'll actually create this div
	// upon receipt of the add() method so we'll
	// leave it null for now.
	this.div_ = null;
	
	// Explicitly call setMap() on this overlay
	this.setMap(googlemap);
}

USGSOverlay.prototype.onAdd = function() {

	var div = document.createElement('div');
	div.style.border = 'none';
	div.style.borderWidth = '0px';
	div.style.position = 'absolute';

	// Create the img element and attach it to the div.
	var img = document.createElement('img');
	img.src = this.image_;
	img.style.width = '100%';
	img.style.height = '100%';
	div.appendChild(img);

	this.div_ = div;

	// Add the element to the "overlayImage" pane.
	var panes = this.getPanes();
	panes.overlayImage.appendChild(this.div_);
};

USGSOverlay.prototype.draw = function() {

	// We use the south-west and north-east
	// coordinates of the overlay to peg it to the correct position and size.
	// To do this, we need to retrieve the projection from the overlay.
	var overlayProjection = this.getProjection();

	// Retrieve the south-west and north-east coordinates of this overlay
	// in LatLngs and convert them to pixel coordinates.
	// We'll use these coordinates to resize the div.
	var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
	var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

	// Resize the image's div to fit the indicated dimensions.
	var div = this.div_;
	div.style.left = sw.x + 'px';
	div.style.top = ne.y + 'px';
	div.style.width = (ne.x - sw.x) + 'px';
	div.style.height = (sw.y - ne.y) + 'px';
};

USGSOverlay.prototype.onRemove = function() {
	this.div_.parentNode.removeChild(this.div_);
};

// [START region_hideshow]
// Set the visibility to 'hidden' or 'visible'.
USGSOverlay.prototype.hide = function() {
	if (this.div_) {
		// The visibility property must be a string enclosed in quotes.
		this.div_.style.visibility = 'hidden';
	}
};

USGSOverlay.prototype.show = function() {
	if (this.div_) {
		this.div_.style.visibility = 'visible';
	}
};

USGSOverlay.prototype.toggle = function() {
	if (this.div_) {
		if (this.div_.style.visibility == 'hidden') {
			this.show();
		} else {
			this.hide();
		}
	}
};

// Detach the map from the DOM via toggleDOM().
// Note that if we later reattach the map, it will be visible again,
// because the containing <div> is recreated in the overlay's onAdd() method.
USGSOverlay.prototype.toggleDOM = function() {
	if (this.getMap()) {
		// Note: setMap(null) calls OverlayView.onRemove()
		this.setMap(null);
	} else {
		this.setMap(this.map_);
	}
};

var pointsArray4Area = [];
//野々市市
//var ini_lat = 36.524048786585695;
//var ini_lng = 136.60613894462585;

var ini_lat = 36.529152705513916;
var ini_lng = 136.6088855266571;
var ini_zoom = 14;

var poly_type = "polyline";//default
var prev_poly_type = "polyline";//default
var lineCoordinates = [];

var circle_center = 0;
var circle_radius = 0;
var circle_flag = false;
var circle_center_set = false;	//tada

var rect_start = 0;
var rect_end = 0;
var rect_flag = false;
var rect_start_set = false;	//tada

//var marker_size = 16;
//var marker_shadow = 'http://wisteriahill.sakura.ne.jp/GMAP/BASE_GMAP_V3/images/shadow.png';



function initialize(){
	
	init_map();
	//-----------------------------------------------------------
	//init_drwaing();
	//-----------------------------------------------------------
	//内部StreetView
	document.getElementById("streetview").style.visibility = "hidden";
	init_innerStreetview(ini_lat,ini_lng);
	
	//外部StreetView
	//document.getElementById("streetview").style.height = "500px";
	//document.getElementById("adv").style.top = "1100px";
	//document.getElementById("streetview").style.visibility = "visible";
	
	
	//init_outerStreetview(ini_lat,ini_lng);
	//StreetViewの青い経路
	//set_svStreet();
	//-----------------------------------------------------------
	
	var marker_icon = 'http://wisteriahill.sakura.ne.jp/GMAP/BASE_GMAP_V3/images/red1.png';
	var anim = google.maps.MapTypeId.ROADMAP;//google.maps.MapTypeId.ROADMAP,google.maps.MapTypeId.BOUNCE
	addMarker(0,ini_lat,ini_lng,marker_icon,16,"",true,false,anim);

	//町内会エリアの事前読み込み
	takePolygon();
	//給◯ポイントの表示
	appraise();
}

//------------------------------------
//mapイベント
function gmap_init(){
	map_center = googlemap.getCenter();
	document.getElementById("ido_byo_10").value = map_center.lat();
	document.getElementById("keido_byo_10").value = map_center.lng();
	conver_10to60();
}

function gmap_click(event) {
	//alert("gmap_click");

	if (poly_type == "polyline"){
		//pointsArray4Area.push(event.latLng);
		
		//set_polygon(pointsArray4Area,"","#ff0000",1);

/*
	//変更した状態を記憶 tada
	var path = polygonsArray[polygonsArray.length-1].getPath();
	pointsArray4Area = [];
	for (var j=0;j< path.length;j++){
		
		pointsArray4Area.push(path.getAt(j));
	}
*/




	}
		
	
	if (poly_type == "circle"){
		if(circle_center_set == false){		//tada
			circle_center_set = true;	//tada
		}	//tada
		
		//Radiusの場合最初のクリックはMap①
		//二番目のクリックはPolyline上になる
		circle_center = event.latLng;

	}
	
	if (poly_type == "rect"){
		if(rect_start_set == false){		//tada
			rect_start_set = true;		//tada
		}	//tada

		//Radiusの場合最初のクリックはMap①
		//二番目のクリックはPolyline上になる
		rect_start = event.latLng;
	}
	
	//set_polyline(pointsArray4Line,"","#ff0000",1);
	
	//標高
	//var clickedLocation = event.latLng;
	//get_hyokou(clickedLocation);
	
	//座標取得
	//get_coordinates(event);
	
	
}

function gmap_dblclick(event){
	//alert("dblclick");
}

function gmap_rightclick(event){
	//alert("rightclick");
}

function gmap_drag(event){
	//alert("drag");
	map_center = googlemap.getCenter();
	
	//gmap_center_changed に集約　2014.08.04 tada
	//v_line.setPosition(map_center.lat(),map_center.lng());
	//h_line.setPosition(map_center.lat(),map_center.lng());
	
	markersArray[0].setPosition(map_center);
	//
	document.getElementById("ido_byo_10").value = map_center.lat();
	document.getElementById("keido_byo_10").value = map_center.lng();
	document.getElementById("rev_address").value = "";
	
	//
	conver_10to60();
}

function gmap_dragend(event){
	//alert("dragend");
	map_center = googlemap.getCenter();	
	
	document.getElementById("ido_byo_10").value = map_center.lat();
	document.getElementById("keido_byo_10").value = map_center.lng();
}

function gmap_mouseup(event){
	//alert("mouseup");
	
	
}

function gmap_mouseout(event){
	//alert("mouseout");
}

function gmap_mouseover(event){
	//alert("mouseover");
}

function gmap_mousedown(event){
	//alert("mousedown");
	
}

function gmap_mousemove(event){
	//alert("mousemove");

	//if ((poly_type == "circle")&&(circle_flag == false)){
	if ((poly_type == "circle")&&(circle_flag == false)&&(circle_center_set == true)){	//tada
		var circle_end = event.latLng;
		
		var radiusArray = [];
		radiusArray.push(circle_center);
		radiusArray.push(circle_end);
		//半径表示
		circle_radius = calc_betweenDistance(circle_center,circle_end);
		
		if (circle_center != 0){
			document.getElementById("radius").value = circle_radius;
		}
		//
		set_circleRadius(radiusArray);
	}
	
	//if ((poly_type == "rect")&&(rect_flag == false)){
	if ((poly_type == "rect")&&(rect_flag == false)&&(rect_start_set == true)){	//tada
		rect_end = event.latLng;
		var diagonalArray = [];
		diagonalArray.push(rect_start);
		diagonalArray.push(rect_end);
		
		//辺の長さ表示
		var start_lat = rect_start.lat();
		var start_lng = rect_start.lng();
		var end_lat = rect_end.lat();
		var end_lng = rect_end.lng();
		
		var temp;
		//widthは同じ緯度の点を使う
		temp = new google.maps.LatLng(start_lat, end_lng);
		var rect_width = calc_betweenDistance(rect_start,temp);
		
		//heightは同じ経度の点を使う
		temp = new google.maps.LatLng(end_lat, start_lng);
		var rect_height = calc_betweenDistance(rect_start,temp);
		
		
		document.getElementById("rect_width").value = rect_width;
		document.getElementById("rect_height").value = rect_height;
		//
		set_rectDiagonal(diagonalArray);
	}

}

function gmap_bounds_changed(event){
	//alert("bounds_changed");
}

function gmap_zoom_changed(event){
	//alert("zoom_changed");

}

function gmap_center_changed(event){
	//alert("center_changed");

	//2014.8.2 tada
	map_center = googlemap.getCenter();

	v_line.setPosition(map_center.lat(),map_center.lng());
	h_line.setPosition(map_center.lat(),map_center.lng());

}

function gmap_maptypeid_changed(){
	//alert("maptypeid_changed:" + googlemap.mapTypeId);
}

//------------------------------------------------
//ストリートビューイベント
function sv_pano_changed(){
	//alert("pano_changed");
	
}

function sv_position_changed(){
	//alert("position_changed");
	
	
}

function sv_pov_changed(){
	//alert("pov_changed");
	
}

function sv_links_changed(){
	//alert("links_changed");
	
}



//------------------------------------------------
//マーカーイベント
function marker_click(me){
	//alert("click me" + me.index);

	//var info = "<div style='width:30px;height:10px;'><b>マーカー(" + me.index + ")</b>と<i>ウィンドウ</i>のサンプルです</div>";
	var info = "<div style='text-align:center;paddding:0;'>" + me.index;

	info += "<br />" + me.title;

	if(Q_point[me.index - 1][4] != ""){
		info += "<br /><a href='" + Q_point[me.index - 1][4] + "' target='_blank'>給◯サービス</a>";
	}

	//出発にする
	info += "<br /><input type='button' value='出発にする' onClick='setStart(" + me.index + ")' />";
	//目標にする
	info += "<br /><input type='button' value='目標にする' onClick='setArive(" + me.index + ")' />";

	marker_infoWindow(me.index,info);
	
	
}

function marker_dragend(m_index){
	
	var pos = markersArray[m_index].getPosition();
 	var lat = pos.lat();
 	var lng = pos.lng();
 	//alert(lat + "," + lng);
}

//------------------------------------------------
//シンボルイベント
function symbol_click(s_index){
	alert(s_index);
}

function symbol_dragend(s_index){
	alert(s_index);
}

//------------------------------------------------
//ジオコーディング
function addressNavi(){
	var address = document.getElementById("realaddress").value;
	geoCode(address);
	
}
//ジオコーディングの結果
function result_geoCode(res){
	document.getElementById("ido_byo_10").value = res.lat();
	document.getElementById("keido_byo_10").value = res.lng();
	//
	conver_10to60();
}

//逆ジオコーディング
function reverseGeocode(){
	var ido = document.getElementById("ido_byo_10").value;
	var keido = document.getElementById("keido_byo_10").value;

	reverse_geoCode(ido,keido);
	
}
//逆ジオコーディングの結果
function result_reverseGeocode(res){
	document.getElementById("rev_address").value = res;
}

//座標(10進)で移動
function coord10Navi(){
	var ido = document.getElementById("ido_byo_10").value;
	var keido = document.getElementById("keido_byo_10").value;
	var dist_coord = new google.maps.LatLng(ido, keido);
	
	v_line.setPosition(ido,keido);
	h_line.setPosition(ido,keido);
	
	markersArray[0].setPosition(dist_coord);
	googlemap.setCenter(dist_coord);
	//
	conver_10to60();
}


//駅名で移動
function stationNavi(){
	var stationname = document.getElementById("station_name").value;
	
	stationname = encodeURI(stationname);
	var data= '?stationname=' + stationname;
	var xmlHttpRequest = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest;
	xmlHttpRequest.open('GET','ekimei_search.php' + data,true);
	// データをリクエスト ボディに含めて送信する
	xmlHttpRequest.send(null);
	xmlHttpRequest.onreadystatechange = function(){
	    var READYSTATE_COMPLETED = 4;
	    var HTTP_STATUS_OK = 200;

	    //if( xmlHttpRequest.readyState == READYSTATE_COMPLETED && xmlHttpRequest.status == HTTP_STATUS_OK )
	    if(xmlHttpRequest.readyState == READYSTATE_COMPLETED){
	        // レスポンス
	        var res = xmlHttpRequest.responseText;
	        
	        if (res != "no"){
				station_name = [];
				station_address = [];
				station_ido = [];
				station_keido = [];
				
				var xmlDoc = xmlHttpRequest.responseXML;
				var infos = xmlDoc.documentElement.getElementsByTagName("info");
				if (infos.length == 1) {
					
					var sta_name = infos[0].getAttribute("name");
					sta_name = decodeURI(sta_name);
					var sta_ido = infos[0].getAttribute("ido");
					var sta_keido = infos[0].getAttribute("keido");
					
					var dist_coord = new google.maps.LatLng(sta_ido, sta_keido);
					//
					googlemap.setZoom(17);
					googlemap.setCenter(dist_coord);
					//
					v_line.setPosition(dist_coord.lat(),dist_coord.lng());
					h_line.setPosition(dist_coord.lat(),dist_coord.lng());
					
					markersArray[0].setPosition(dist_coord);
					//
					document.getElementById("ido_byo_10").value = sta_ido;
					document.getElementById("keido_byo_10").value = sta_keido;
					conver_10to60();
					//
					return;
					
				} else{
					var stainfo = "&nbsp;&nbsp;&nbsp;&nbsp; 複数の駅がみつかりました" + "<BR>";
					stainfo += '&nbsp;&nbsp;&nbsp;&nbsp; <select id="stations" onChange="sel_station()">';
					stainfo += '<option value="-1">▼選んでください</option>';
					
					for (var i = 0; i < infos.length; i++) {
						var sta_name = infos[i].getAttribute("name");
						sta_name = decodeURI(sta_name);
						var sta_address = infos[i].getAttribute("address");
						sta_address = decodeURI(sta_address);
						var sta_ido = infos[i].getAttribute("ido");
						var sta_keido = infos[i].getAttribute("keido");
						
						station_name[i] = sta_name;
						station_address[i] = sta_address;
						station_ido[i] = sta_ido;
						station_keido[i] = sta_keido;
						
						stainfo += '<option value="' + i + '">' + sta_name + '</option>';
						
					}
					
					stainfo += '<option value="reset">' + "リセット" + '</option>';
					
					stainfo += '</select>';
					
					document.getElementById("sta_info").innerHTML = stainfo;
					
					document.getElementById("phonemes").innerHTML = "";
					return;
				}
				
			}else{
				alert("見つかりませんでした。住所移動で再度、検索してみてください。");
				return;
			}
	    }
	}
}

function sel_station(){
	var sel_num = document.getElementById("stations").value;
	
	if (sel_num == "-1") {
		return;
	}
	
	if (sel_num == "reset"){
		var org = '&nbsp;&nbsp;&nbsp;&nbsp; <input type="text" id="station_name" size=25 value="" />';
		org += '<input type="button" id="stationmove" value="移動" onclick="stationNavi()" />';
		
		document.getElementById("sta_info").innerHTML = org;
		
	}else{
		var dist_coord = new google.maps.LatLng(station_ido[sel_num], station_keido[sel_num]);
		googlemap.setZoom(17);
		googlemap.setCenter(dist_coord);
		//
		v_line.setPosition(dist_coord.lat(),dist_coord.lng());
		h_line.setPosition(dist_coord.lat(),dist_coord.lng());
		
		markersArray[0].setPosition(dist_coord);
		//
		document.getElementById("ido_byo_10").value = station_ido[sel_num];
		document.getElementById("keido_byo_10").value = station_keido[sel_num];
		conver_10to60();
	}
	//
}

//ランドマーク名で移動
function landmarkNavi(){
	var landname = document.getElementById("landmark_name").value;
	
	landname = encodeURI(landname);
	var data= '?landmarkname=' + landname;
	var xmlHttpRequest = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest;
	xmlHttpRequest.open('GET','landmei_search.php' + data,true);
	// データをリクエスト ボディに含めて送信する
	xmlHttpRequest.send(null);
	xmlHttpRequest.onreadystatechange = function(){
	    var READYSTATE_COMPLETED = 4;
	    var HTTP_STATUS_OK = 200;

	    //if( xmlHttpRequest.readyState == READYSTATE_COMPLETED && xmlHttpRequest.status == HTTP_STATUS_OK )
	    if(xmlHttpRequest.readyState == READYSTATE_COMPLETED){
	    	// レスポンス
	        var res = xmlHttpRequest.responseText;
	    	if (res != "no"){
	    		landmark_name = [];
				landmark_address = [];
				landmark_ido = [];
				landmark_keido = [];
				
				var xmlDoc = xmlHttpRequest.responseXML;
				var infos = xmlDoc.documentElement.getElementsByTagName("info");
	    		if (infos.length == 1) {
	    			var land_name = infos[0].getAttribute("name");
					land_name = decodeURI(land_name);
					
					var land_ido = infos[0].getAttribute("ido");
					var land_keido = infos[0].getAttribute("keido");
					
					var dist_coord = new google.maps.LatLng(land_ido, land_keido);
					//
					googlemap.setZoom(17);
					googlemap.setCenter(dist_coord);
					
					//
					v_line.setPosition(dist_coord.lat(),dist_coord.lng());
					h_line.setPosition(dist_coord.lat(),dist_coord.lng());
					
					markersArray[0].setPosition(dist_coord);
					//
					document.getElementById("ido_byo_10").value = land_ido;
					document.getElementById("keido_byo_10").value = land_keido;
					conver_10to60();
					return;
	    			
	    		} else{
					
					var landinfo = "&nbsp;&nbsp;&nbsp;&nbsp; 複数の場所がみつかりました" + "<BR>";
					landinfo += '&nbsp;&nbsp;&nbsp;&nbsp; <select id="landmarks" onChange="sel_landmark()">';
					landinfo += '<option value="-1">▼選んでください</option>';
					
					for (var i = 0; i < infos.length; i++) {
						var land_name = infos[i].getAttribute("name");
						land_name = decodeURI(land_name);
						var land_address = infos[i].getAttribute("address");
						land_address = decodeURI(land_address);
						var land_ido = infos[i].getAttribute("ido");
						var land_keido = infos[i].getAttribute("keido");
						
						landmark_name[i] = land_name;
						landmark_address[i] = land_address;
						landmark_ido[i] = land_ido;
						landmark_keido[i] = land_keido;
						
						landinfo += '<option value="' + i + '">' + land_name + '(' + land_address + ')' + '</option>';
						//alert(sta_name + "/" + sta_ido + "/" + sta_keido);
					}
					
					landinfo += '<option value="reset">' + "リセット" + '</option>';
					
					landinfo += '</select>';
					
					document.getElementById("land_info").innerHTML = landinfo;
					
					document.getElementById("phonemes").innerHTML = "";
					return;	
	    		}
	    	
	    	}else{
	    		alert("見つかりませんでした。住所移動で再度、検索してみてください。");
				return;
	    	}
	    	
	    	
	    }
	}
}

function sel_landmark(){
	var sel_num = document.getElementById("landmarks").value;
	
	if (sel_num == "-1") {
		return;
	}
	
	if (sel_num == "reset"){
		var org = '&nbsp;&nbsp;&nbsp;&nbsp; <input type="text" id="landmark_name" size=25 value="" />';
		org += '<input type="button" id="landmarkmove" value="移動" onclick="landmarkNavi()" />';
		
		document.getElementById("land_info").innerHTML = org;
		
	}else{
		var dist_coord = new google.maps.LatLng(landmark_ido[sel_num], landmark_keido[sel_num]);
		googlemap.setZoom(17);
		googlemap.setCenter(dist_coord);
		//
		v_line.setPosition(dist_coord.lat(),dist_coord.lng());
		h_line.setPosition(dist_coord.lat(),dist_coord.lng());
		
		markersArray[0].setPosition(dist_coord);
		//
		document.getElementById("ido_byo_10").value = landmark_ido[sel_num];
		document.getElementById("keido_byo_10").value = landmark_keido[sel_num];
		conver_10to60();
	}
}

//電話番号で移動
function phoneNavi(){
	var domain = document.getElementById("domain").value;
	var dirname  = document.getElementById("dirname").value;
	
	var phonenumber = document.getElementById("phonenumber").value;
	phonenumber = z2h_ascii(phonenumber);
	var encName = encodeURIComponent("phonenumber");
	var encValue = encodeURIComponent(phonenumber);
	data= '?' + encName + '=' + encValue;
	var xmlHttpRequest = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest;
	xmlHttpRequest.open('GET','phohe_search.php' + data,true);
	// データをリクエスト ボディに含めて送信する
	xmlHttpRequest.send(null);
	xmlHttpRequest.onreadystatechange = function(){
	    var READYSTATE_COMPLETED = 4;
	    var HTTP_STATUS_OK = 200;

	    //if( xmlHttpRequest.readyState == READYSTATE_COMPLETED && xmlHttpRequest.status == HTTP_STATUS_OK )
	    if(xmlHttpRequest.readyState == READYSTATE_COMPLETED){
	    	// レスポンス
	    	var targetaddress = xmlHttpRequest.responseText;
			if (targetaddress == "nodata") {
				alert("取得できませんでした");
				//showmessage(6);
			} else {
				targetaddress = z2h_ascii(targetaddress);
				
				geoCode(targetaddress);
				//glocalsearch.execute(targetaddress);
				return false;
			}
	    	
	    	
	    }
	}
	
}
//座標(60進)で移動
function coord60Navi(){
	var ido_do = document.getElementById("ido_do_60").value;
	ido_do = z2h_ascii(ido_do);
	ido_do = parseInt(ido_do);
	var ido_hun = document.getElementById("ido_hun_60").value;
	ido_hun = z2h_ascii(ido_hun);
	ido_hun = parseInt(ido_hun);
	var ido_hun10 = ido_hun/60;
	var ido_byo = document.getElementById("ido_byo_60").value;
	ido_byo = z2h_ascii(ido_byo);
	ido_byo = parseFloat(ido_byo);
	var ido_byo10 = ido_byo / 3600;
	var ido_latlon10 = ido_do + ido_hun10 + ido_byo10;
	
	var keido_do = document.getElementById("keido_do_60").value;
	keido_do = z2h_ascii(keido_do);
	keido_do = parseInt(keido_do);
	var keido_hun = document.getElementById("keido_hun_60").value;
	keido_hun = z2h_ascii(keido_hun);
	keido_hun = parseInt(keido_hun);
	var keido_hun10 = keido_hun / 60;
	var keido_byo = document.getElementById("keido_byo_60").value;
	keido_byo = z2h_ascii(keido_byo);
	keido_byo = parseFloat(keido_byo);
	var keido_byo10 = keido_byo / 3600;
	var keido_latlon10 = keido_do + keido_hun10 + keido_byo10;
	
	document.getElementById("ido_byo_10").value = ido_latlon10;
	document.getElementById("keido_byo_10").value = keido_latlon10;
	
	set_wikimapicoord(ido_latlon10,keido_latlon10);
	
	var dist_coord = new google.maps.LatLng(ido_latlon10, keido_latlon10);
	googlemap.setZoom(17);
	googlemap.setCenter(dist_coord);
	//
	v_line.setPosition(dist_coord.lat(),dist_coord.lng());
	h_line.setPosition(dist_coord.lat(),dist_coord.lng());
	
	markersArray[0].setPosition(dist_coord);
}

//ユーザー関数
function z2h_ascii(src) {
	var str = new String;
	var len = src.length;
	for (var i = 0; i < len; i++) {
		var c = src.charCodeAt(i);
		if (c >= 65281 && c <= 65374 && c != 65340) {
			str += String.fromCharCode(c - 65248);
		} else if (c == 8217) {
			str += String.fromCharCode(39);
		} else if (c == 8221) {
			str += String.fromCharCode(34);
		} else if (c == 12288) {
			str += String.fromCharCode(32);
		} else if (c == 65507) {
			str += String.fromCharCode(126);
		} else if (c == 65509) {
			str += String.fromCharCode(92);
		} else {
			str += src.charAt(i);
		} 
	}
	return str;
}

//座標変換
function conver_10to60() {
	
	var ido_latlon10 = document.getElementById("ido_byo_10").value;
	ido_latlon10 = z2h_ascii(ido_latlon10);
	var ido_do = Math.floor(eval(ido_latlon10));
	var ido_hunbyo = eval(ido_latlon10) - ido_do;
	var temp_ido_hun = ido_hunbyo * 60;
	var ido_hun = Math.floor(temp_ido_hun);
	var temp_ido_byo = temp_ido_hun - ido_hun;
	var ido_byo = temp_ido_byo * 60;
	var keido_latlon10 = document.getElementById("keido_byo_10").value;
	
	keido_latlon10 = z2h_ascii(keido_latlon10);
	var keido_do = Math.floor(eval(keido_latlon10));
	var keido_hunbyo = eval(keido_latlon10) - keido_do;
	var temp_keido_hun = keido_hunbyo * 60;
	var keido_hun = Math.floor(temp_keido_hun);
	var temp_keido_byo = temp_keido_hun - keido_hun;
	var keido_byo = temp_keido_byo * 60;
	
	document.getElementById("ido_do_60").value = ido_do;
	document.getElementById("ido_hun_60").value = ido_hun;
	document.getElementById("ido_byo_60").value = ido_byo;
	document.getElementById("keido_do_60").value = keido_do;
	document.getElementById("keido_hun_60").value = keido_hun;
	document.getElementById("keido_byo_60").value = keido_byo;
	
}

//ポリライン
function get_coordinates(event){
	lineCoordinates.length = 0;
	lineCoordinates.push(event.latLng);
	
}

function set_polylineTest(){
	
	lineCoordinates.push(new google.maps.LatLng(34.8109665019401,135.54000451077275));
	lineCoordinates.push(new google.maps.LatLng(34.8109665019401,135.5415494631653));
	lineCoordinates.push(new google.maps.LatLng(34.811913442834054,135.54242922772218));
	
	addPolyline(0,"title",lineCoordinates,"#FF0000",0.5,3,false,false);
	//addArrowline(0,"title","head",lineCoordinates,"#FF0000",0.5,3,false,false);
	
	//addDotline(0,"title",lineCoordinates,"#FF0000",0.6,3,false,false);
	
	/*
	var symbol = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
	addSymbolanimation(symbol,lineCoordinates,"#000000","#000000","#FF0000",true,true);
	animateSymbol(0);
	*/
}


function polyline_editable(index,type){
	//type:true,false
	polylinesArray[index].setEditable(type);
}


function polyline_draggable(index,type){
	//type:true,false
	polylinesArray[index].setDraggable(type);
}

function polyline_click(){
	//ラインの後ろの座標

	//var path = polylinesArray[polylinesArray.length-1].getPath();
	//var endCoordinate = path.getAt(path.length-1);
	if (poly_type == "circle"){
		//radius消去②
		if (polylinesArray){
			if (polylinesArray.length != 0){
				polylinesArray[0].setMap(null);
				polylinesArray.length = 0;
			}
		}
		
		//Circle描画
		circle_flag = true;
		set_circlePolygon();
	}
	
	if (poly_type == "rect"){
		//diagonal消去②
		if (polylinesArray){
			if (polylinesArray.length != 0){
				polylinesArray[0].setMap(null);
				polylinesArray.length = 0;
			}
		}
		
		//Rectangle描画
		rect_flag = true;
		set_rectPolygon();
	}
}

function polyline_dblclick(){
	//alert("dblclick");
	
}

function polyline_rightclick(){
	//alert("rightclick");
	
}

function polyline_mousedown(){
	//alert("mousedown");
	
}

function polyline_mouseup(){
	//alert("mouseup");
	
}

function polyline_mouseover(){
	//alert("mouseover");
	
}

function polyline_mouseout(){
	//alert("mouseout");
	
}

function polyline_dragend(){
	//alert("dragend");
	
}

function polyline_insert_at(){
	//alert("insert_at");
	
	
	
}

function polyline_remove_at(){
	//alert("remove_at");
	
	
	
}

function polyline_set_at(){
	//alert("set_at");
	
	
	
}

function arrowline_click(){
	//
}
function arrowline_dblclick(){
	//
}
function arrowline_rightclick(){
	//
}
function arrowline_mousedown(){
	//
}
function arrowline_mouseup(){
	//
}
function arrowline_mouseover(){
	//
}
function arrowline_mouseout(){
	//
}
function arrowline_insert_at(){
	//
}
function arrowline_remove_at(){
	//
}
function arrowline_set_at(){
	//
}
function dotline_click(){
	//
}
function dotline_dblclick(){
	//
}
function dotline_rightclick(){
	//
}
function dotline_mousedown(){
	//
}
function dotline_mouseup(){
	//
}
function dotline_mouseover(){
	//
}
function dotline_mouseout(){
	//
}
function dotline_insert_at(){
	//
}
function dotline_remove_at(){
	//
}
function dotline_set_at(){
	//
}
function animline_click(){
	//
}
function animline_dblclick(){
	//
}
function animline_rightclick(){
	//
}
function animline_mousedown(){
	//
}
function animline_mouseup(){
	//
}
function animline_mouseover(){
	//
}
function animline_mouseout(){
	//
}
function animline_insert_at(){
	//
}
function animline_remove_at(){
	//
}
function animline_set_at(){
	//
}







//ポリゴン
function set_polygonTest(){
	lineCoordinates.push(new google.maps.LatLng(34.8109665019401,135.54000451077275));
	lineCoordinates.push(new google.maps.LatLng(34.8109665019401,135.5415494631653));
	lineCoordinates.push(new google.maps.LatLng(34.811913442834054,135.54242922772218));
	
	addPolygon(0,"polygon",lineCoordinates,"#FF0000",0.8,2,"#FF0000",0.35,true,true);
	
	//-------------------------------------------------------------------------------
	
	var center = new google.maps.LatLng(34.8109665019401,135.5415494631653);
	var radius = 100;
	addCirclepolygon(0,"circle",center,radius,"#FF0000",0.8,2,"#FF0000",0.35,false,false);
	
	//-------------------------------------------------------------------------------
	
	var southWest = new google.maps.LatLng(34.8111074426697,135.54004742611696);
	var northEast = new google.maps.LatLng(34.81154788089523,135.54140998829652);
	var bounds = new google.maps.LatLngBounds(southWest,northEast);
	
	//var bounds = googlemap.getBounds();
	
	addRectpolygon(0,"rectangle",bounds,"#FF0000",0.8,2,"#FF0000",0.35,false,false);
	
}

function polygon_click(event){	
	var index = this.index;
	var title = this.title;
	
	var position = event.latLng;
	
	var polygonVertex = "";
	
	//MVCArray of LatLngs
	var vertices = this.getPath();
	
	for (var i =0; i < vertices.length; i++) {
		var xy = vertices.getAt(i);
		polygonVertex += "<br />" + "Coordinate: " + i + "<br />" + xy.lat() +"," + xy.lng();
	}
	
	
	
	var htmlStrings = index + "番目のポリゴン:" + title + "<br>よろしくね<br>" + polygonVertex;
	//polygon_infoWindow(0,htmlStrings,position);
	
	
}

function circlerect_click(event){
	var index = this.index;
	var title = this.title;
	
	var position = event.latLng;	
	
	var htmlStrings = index + "番目のポリゴン:" + title + "<br>よろしくね<br>";
	//polygon_infoWindow(0,htmlStrings,position);
	
	
}

//以下の　polygon　３関数は、１つに統合できる　tada
function polygon_insert_at(){
	//
	//再計算
	if (poly_type == "polyline"){
		//if (polygonsArray.length > 1){	//tada
			var area = calc_Area();
			document.getElementById("meter_area").value = area;
			document.getElementById("calcarea").value = convert_tani();
			value_compare();
		//}	//tada
	}

	//alert("this is insert_at polygon");	

	//変更した状態を記憶 tada
	var path = polygonsArray[polygonsArray.length-1].getPath();
	pointsArray4Area = [];
	for (var j=0;j< path.length;j++){
		
		pointsArray4Area.push(path.getAt(j));
	}
}

function polygon_remove_at(){
	//
	//再計算
	if (poly_type == "polyline"){
		//if (polygonsArray.length > 1){	//tada
			var area = calc_Area();
			document.getElementById("meter_area").value = area;
			document.getElementById("calcarea").value = convert_tani();
			value_compare();
		//}	//tada
	}

	//alert("this is remove_at polygon");

	//変更した状態を記憶 tada
	var path = polygonsArray[polygonsArray.length-1].getPath();
	pointsArray4Area = [];
	for (var j=0;j< path.length;j++){
		
		pointsArray4Area.push(path.getAt(j));
	}
}

function polygon_set_at(){
	//
	//再計算
	if (poly_type == "polyline"){
		//if (polygonsArray.length > 1){	//tada
			var area = calc_Area();
			document.getElementById("meter_area").value = area;
			document.getElementById("calcarea").value = convert_tani();
			value_compare();
		//}	//tada
	}

	//alert("this is set_at polygon");

	//変更した状態を記憶 tada
	var path = polygonsArray[polygonsArray.length-1].getPath();
	pointsArray4Area = [];
	for (var j=0;j< path.length;j++){
		
		pointsArray4Area.push(path.getAt(j));
	}
}

function CirclePolygon_radius_changed(radius){
	//再計算
	//alert(radius);
	circle_radius = radius;
	if (circle_center != 0){
		document.getElementById("radius").value = circle_radius;
		
		//円の面積計算
		var area = calc_circleArea(circle_radius);
		
		document.getElementById("meter_area").value = area;
		document.getElementById("calcarea").value = convert_tani();
		value_compare();
	}
	
	
}
function CirclePolygon_center_changed(center){
	//alert(center);
	var lat = center.lat();
	var lng = center.lng();
	
	//サークルセンターの記憶	tada
	circle_center = center;	
}

function RectPolygon_bounds_changed(sw,ne){
	var nw = new google.maps.LatLng(ne.lat(),sw.lng());
	var se = new google.maps.LatLng(sw.lat(),ne.lng());
	//辺の長さ計算
	var width = calc_betweenDistance(sw,se);
	var height = calc_betweenDistance(sw,nw);
	
	document.getElementById("rect_width").value = width;
	document.getElementById("rect_height").value = height;
	
	//矩形の面積計算
	var rectArray = [];
	rectArray.push(sw);
	rectArray.push(nw);
	rectArray.push(ne);
	rectArray.push(se);
	rectArray.push(sw);//閉じる
	
	var area = calc_rectArea(rectArray);
	document.getElementById("meter_area").value = area;
	document.getElementById("calcarea").value = convert_tani();
	value_compare();

	//rect 記憶用	tada
	rect_start = nw;
	rect_end   = se;
}





function polygon_editable(index,type){
	//type:true,false
	polygonsArray[index].setEditable(type);

}


function polygon_draggable(index,type){
	//type:true,false
	polygonsArray[index].setDraggable(type);
}




//ルート検索
function show_routeInfo(){
	
	var from_lat = 34.739071;
	var from_lng = 135.499326;
	var to_lat = 34.74030529820892;
	var to_lng = 135.50386429765322;
	
	var from = new google.maps.LatLng(from_lat,from_lng);
	var to = new google.maps.LatLng(to_lat,to_lng);
	
	var via = [];
	//var loc1 = new google.maps.LatLng(34.74174474188263,135.50114393234253);
	//via =  [{ location:loc1}];
	
	var travel_mode = google.maps.DirectionsTravelMode.DRIVING;
	//DRIVING：道路網を利用した標準の運転ルート
	//WALKING：自転車専用道路と優先道路を使用した自転車ルート
	//BICYCLING：歩行者専用道路と歩道を使用した徒歩ルート
	//TRANSIT：公共交通機関を使用したルート
	
	route_search(from,via,to,travel_mode);
	
}

function route_info(response){
	
	var k_meters = 0;
	k_meters = response.routes[0].legs[0].distance.text; // 距離(km)
	
	
	var meters = 0;
	 for(var i=0; i<response.routes[0].legs.length; i++){
	 	meters += response.routes[0].legs[i].distance.value; // 距離(m)
	 }
	 
	//alert(k_meters + "(" + meters + ")");
	
	
	var myRoute = response.routes[0].legs[0];
	var temp = "";
	for (var i = 0; i < myRoute.steps.length; i++) {
		/*
		var marker = new google.maps.Marker({
			position: myRoute.steps[i].start_point,
			map: map
		});
		attachInstructionText(marker, myRoute.steps[i].instructions);
		markerArray[i] = marker;
		*/
		temp += myRoute.steps[i].instructions + "/";
		
	}
	
	//alert(temp);
	
	
}






//グラウンド　オーバーレイ
function set_groundoverlay(){
	var sw_lat = 34.809891820952664;
	var sw_lng = 135.54203226078798;
	var ne_lat = 34.81101935474208;
	var ne_lng = 135.54334117878724;
	
	var image = "http://wisteriahill.sakura.ne.jp/GMAP/BASE_GMAP_V3/images/gamba.png";
	
	addGroundOverlay(sw_lat,sw_lng,ne_lat,ne_lng,image);
}



//カスタム　オーバーレイ
function set_customoverlay(){
	//国土地理院の古地図コレクション
	//番号：182 　　史料名：伊能中図　中部近畿
	
	var swBound = new google.maps.LatLng(33.33970700424026,135.15380859375);
	var neBound = new google.maps.LatLng(37.75334401310656,138.40576171875);
	var srcImage = 'http://wisteriahill.sakura.ne.jp/GMAP/BASE_GMAP_V3/images/inoh.jpg';
	
	addCustomOverlay(swBound,neBound,srcImage);
}

//ライブラリを使った距離計算
function calc_betweenDistance(from,to){
	var distance = google.maps.geometry.spherical.computeDistanceBetween(from, to);
	return distance;
}

//ライブラリを使った多角形の面積計算
function calc_Area(){
	
	var path = polygonsArray[polygonsArray.length-1].getPath();
	
	var coordinatesArray = [];
	for (var j=0;j< path.length;j++){
		
		coordinatesArray.push(path.getAt(j));
	}
	coordinatesArray.push(path.getAt(0));
	var area = google.maps.geometry.spherical.computeArea(coordinatesArray);
	
	return area;
}

//円の面積計算
function calc_circleArea(radius){
	var area = radius * radius * Math.PI;
	
	return area;
}

//矩形の面積計算
function calc_rectArea(rectArray){
	var area = google.maps.geometry.spherical.computeArea(rectArray);
	
	return area;
}

function calc_rectAreaII(){
	var bounds = polygonsArray[polygonsArray.length-1].getBounds();
	var ne = bounds.getNorthEast();
  	var sw = bounds.getSouthWest();
	
	var rectArray = [];
	var nw = new google.maps.LatLng(ne.lat(),sw.lng());
	var se = new google.maps.LatLng(sw.lat(),ne.lng());
	rectArray.push(sw);
	rectArray.push(nw);
	rectArray.push(ne);
	rectArray.push(se);
	rectArray.push(sw);//閉じる
	
	var area = google.maps.geometry.spherical.computeArea(rectArray);
	
	return area;
	
}

function calc_rectAreaIII(sw,ne){
	var rectArray = [];
	var nw = new google.maps.LatLng(ne.lat(),sw.lng());
	var se = new google.maps.LatLng(sw.lat(),ne.lng());
	rectArray.push(sw);
	rectArray.push(nw);
	rectArray.push(ne);
	rectArray.push(se);
	rectArray.push(sw);//閉じる
	
	var area = google.maps.geometry.spherical.computeArea(rectArray);
	
	return area;
	
}

//標高
function result_hyokou(res){
	//
	
	return res;
}

//*****************************************************************************************
function set_wikimapicoord(ido,keido){
	if (eval(ido) >= 0) {
		ido = ido + "N";
	} else{
		ido = ido + "S";
	}
	
	if (eval(keido) >= 0) {
		keido = keido + "E";
	} else{
		keido = keido + "W";
	}
	
	
	document.getElementById("wikimapia_coord").value = ido + "," + keido;
}


function go_wikimapia(){
	
	var ido = document.getElementById("ido_byo_10").value;
	var keido = document.getElementById("keido_byo_10").value;
	var zlevel = document.getElementById("mapzoomlevel").value;
	
	var url = 'http://wikimapia.org/#lat=' + ido + '&lon=' + keido + '&z=' + zlevel + '&l=7&m=b';
	
	if (wikimapia_win != null) {
		wikimapia_win.close();
		
	}
	
	wikimapia_win = window.open(url,"","width=800,height=600,scrollbars=yes,resizable=yes");
	
}

//***************************************************************************
//対角線描画
function set_rectDiagonal(diagonalArray){
	if (polylinesArray){
		if (polylinesArray.length != 0){
			polylinesArray[0].setMap(null);
			polylinesArray.length = 0;
		}
	}
	addPolyline(0,"title",diagonalArray,"#FF0000",0.5,3,false,false);
}

//矩形描画
function set_rectPolygon(){
	var chk_editable = document.getElementById("editable").checked;
	var chk_draggable = document.getElementById("draggable").checked;
	
	var start_lat = rect_start.lat();
	var start_lng = rect_start.lng();
	var end_lat = rect_end.lat();
	var end_lng = rect_end.lng();
	
	var southWest_lat = 0;
	var southWest_lng = 0;
	var northEast_lat = 0;
	var northEast_lng = 0;
	
	
	//緯度
	if (start_lat > end_lat) {
		southWest_lat = end_lat;
		northEast_lat = start_lat;
	} else {
		southWest_lat = start_lat;
		northEast_lat = end_lat;
	}
	
	//経度
	if (start_lng > end_lng){
		southWest_lng = end_lng;
		northEast_lng = start_lng;
	}else{
		southWest_lng = start_lng;
		northEast_lng = end_lng;
	}
	
	var southWest = new google.maps.LatLng(southWest_lat,southWest_lng);
	var northEast = new google.maps.LatLng(northEast_lat,northEast_lng);
	var bounds = new google.maps.LatLngBounds(southWest,northEast);
	addRectpolygon(0,"rectangle",bounds,"#FF0000",0.8,2,"#FF0000",0.35,chk_editable,chk_draggable);
	
	//矩形の面積計算
	var rectArray = [];
	var northWest = new google.maps.LatLng(northEast_lat,southWest_lng);
	var southEast = new google.maps.LatLng(southWest_lat,northEast_lng);
	rectArray.push(southWest);
	rectArray.push(northWest);
	rectArray.push(northEast);
	rectArray.push(southEast);
	rectArray.push(southWest);//閉じる
	
	var area = calc_rectArea(rectArray);
	
	document.getElementById("meter_area").value = area;
	document.getElementById("calcarea").value = convert_tani();
	value_compare();
	
}

//半径描画
function set_circleRadius(radiusArray){
	if (polylinesArray){
		if (polylinesArray.length != 0){
			polylinesArray[0].setMap(null);
			polylinesArray.length = 0;
		}
	}
	addPolyline(0,"title",radiusArray,"#FF0000",0.5,3,false,false);
}

//円描画
function set_circlePolygon(){
	var chk_editable = document.getElementById("editable").checked;
	var chk_draggable = document.getElementById("draggable").checked;

	addCirclepolygon(0,"circle",circle_center,circle_radius,"#FF0000",0.8,2,"#FF0000",0.35,chk_editable,chk_draggable);
	
	//円の面積計算
	var area = calc_circleArea(circle_radius);
		
	//document.getElementById("meter_area").value = area;
	document.getElementById("meter_area").value = area;

	document.getElementById("calcarea").value = convert_tani();
	value_compare();
}

//多角形描画
function set_polygon(Coordinates,title,color,opacity){
	//alert(polygonsArray.length);

	//前の描画をリムーブしている

	if (polygonsArray){
		if (polygonsArray.length != 0){
			for (var i=0;i< polygonsArray.length;i++){			
				polygonsArray[i].setMap(null);
			}
		}
	}
		
	var chk_editable = document.getElementById("editable").checked;
	var chk_draggable = document.getElementById("draggable").checked;

	addPolygon(0,"polygon",Coordinates,"#FF0000",0.8,2,"#FF0000",0.1,chk_editable,chk_draggable);	
	
	//多角形の面積計算
	//if (polygonsArray.length > 1){	//tada
		var area = calc_Area();
		
		document.getElementById("meter_area").value = area;
		document.getElementById("calcarea").value = convert_tani();
		value_compare();
	//}	//tada
	
	//alert("this is set_polygon");
}





function polyEdit(){
	
	var chk_editable = document.getElementById("editable").checked;
	if (chk_editable == true){
		
		for (i in polygonsArray){
			polygon_editable(i,true)
		}
		
		if (poly_type == "circle"){
			document.getElementById("draggable").checked = true;
		}
		
	}else{
		
		for (i in polygonsArray){
			polygon_editable(i,false)
		}

	}
	
}

function polyDrag(){
	var chk_draggable = document.getElementById("draggable").checked;
	//
	var chk_editable = document.getElementById("editable").checked;
	if (poly_type == "circle"){
		//if (chk_editable == true && circle_flag == false){
		if (chk_editable == true && circle_flag == false){	//tada
			if (chk_draggable == false){
				alert("円の場合、編集可能なら中央のマーカーで移動可能です");
				document.getElementById("draggable").checked = true;
				
			}
		}
	}
	
	
	
	if (chk_draggable == true){
		
		for (i in polygonsArray){
			polygon_draggable(i,true)
		}
		
	}else{
		
		for (i in polygonsArray){
			polygon_draggable(i,false)
		}
		
	}
	
}


function check(){
	/*
	var from = new google.maps.LatLng(34.8109665019401,135.54000451077275);
	var to = new google.maps.LatLng(34.8109665019401,135.5415494631653);
	
	var res = calc_distance(from,to);
	*/
	var distance = 0;
	var path = polylinesArray[polylinesArray.length-1].getPath();
	for (var j=0;j< path.length - 1;j++){
		//alert(path.getAt(j));
		var from = path.getAt(j);
		var to = path.getAt(j + 1);
		var res = calc_betweenDistance(from,to);
		distance += res;
	}
	distance = Math.ceil(distance);
	//alert(distance);
	/*
	var temp = "";
	for (var i=0;i< polylinesArray.length;i++){
		var path = polylinesArray[i].getPath();
		
		//alert(path.length);
		
		
		for (var j=0;j< path.length;j++){
			//alert(path.getAt(j));
			temp += path.getAt(j) + "/";
		}
		
		temp += "|";
	}
	document.getElementById("txt").value = temp;
	*/
}

//***************************************************************************
function convert_tani(){
	var tani = document.getElementById("conv_tani").value;

	var c_meters = document.getElementById("meter_area").value;
	//3桁区切りを消す
	var meters = String(c_meters).replace(/,/g, '');

	/*
	
	if ((meters == "")||(meters == 0)){
		
		return 0;
	}
	*/
	
	var conv_dist = 0;
	
	
	if (tani == "m㎡") {
		conv_dist = eval(meters) / (0.01 * 0.0001);
		document.getElementById("tani").innerHTML = tani;
		
	} else if (tani == "c㎡") {
		conv_dist = eval(meters) / (0.0001);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "㎡") {
		conv_dist = eval(meters) / (1);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "k㎡") {
		conv_dist = eval(meters) / (1000000);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "a") {
		conv_dist = eval(meters) / (100);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "ha") {
		conv_dist = eval(meters) / (10000);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "in2") {
		conv_dist = eval(meters) / (645.16 * 0.01 * 0.0001);
		document.getElementById("tani").innerHTML = "in" + "&sup2;";
		
	}  else if (tani == "ft2") {
		conv_dist = eval(meters) / (0.09290304);
		document.getElementById("tani").innerHTML = "ft" + "&sup2;";
		
	}  else if (tani == "yd2") {
		conv_dist = eval(meters) / (0.83612736);
		document.getElementById("tani").innerHTML = "yd" + "&sup2;";
		
	}  else if (tani == "mi2") {
		conv_dist = eval(meters) / (2.589988110336 * 1000000);
		document.getElementById("tani").innerHTML = "mi" + "&sup2;";
		
	}  else if (tani == "rood") {
		conv_dist = eval(meters) / (1011.7141056);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "ac") {
		conv_dist = eval(meters) / (4046.8564224);
		document.getElementById("tani").innerHTML = tani;
		
	}  else if (tani == "joh_edo") {
		conv_dist = eval(meters) / (1.5488);
		document.getElementById("tani").innerHTML = "畳";
		
	}  else if (tani == "joh_danchi") {
		conv_dist = eval(meters) / (1.445);
		document.getElementById("tani").innerHTML = "畳";
		
	}  else if (tani == "shaku") {
		conv_dist = eval(meters) / (0.1 * 0.1 * 3.305785);
		document.getElementById("tani").innerHTML = "勺";
		
	}  else if (tani == "goh") {
		conv_dist = eval(meters) / (0.1 * 3.305785);
		document.getElementById("tani").innerHTML = "合";
		
	}  else if (tani == "tubo") {
		conv_dist = eval(meters) / (3.305785);
		document.getElementById("tani").innerHTML = "坪";
		
	}  else if (tani == "se") {
		conv_dist = eval(meters) / (30 * 3.305785);
		document.getElementById("tani").innerHTML = "畝";
		
	}  else if (tani == "tan") {
		conv_dist = eval(meters) / (10 * 30 * 3.305785);
		document.getElementById("tani").innerHTML = "反";
		
	}  else if (tani == "choh") {
		conv_dist = eval(meters) / (10 * 10 * 30 * 3.305785);
		document.getElementById("tani").innerHTML = "町";
		
	} 
	
	
	if ((meters != "")&&(meters != 0)){
		var seisu = Math.floor(conv_dist);
		var shousu = conv_dist - seisu;
		
		if (shousu >= 0.0001) {
			
			conv_dist = eval(conv_dist).toFixed(4);
		}
		
		//3桁区切りで表示
		document.getElementById("calcarea").value = toFormattedNumberString(conv_dist);
	}

	//return conv_dist;
	//3桁区切りで表示
	return toFormattedNumberString(conv_dist);
	
}

function clear_params() {

	document.getElementById("realaddress").value = "";
	
	document.getElementById("phonenumber").value = "";
	
	document.getElementById("calcarea").value = "";
	document.getElementById("meter_area").value = "";
	
	document.getElementById("compare_value").value = "";
	
	
	if (poly_type == "polyline"){
		pointsArray4Area = [];
		
		if (polygonsArray){
			if (polygonsArray.length != 0){
				for (var i=0;i< polygonsArray.length;i++){
					
					polygonsArray[i].setMap(null);
				}
			}
			
			polygonsArray.length = 0;
		}
	}
	if (poly_type == "circle"){
		pointsArray4Area = [];
		
		if (polygonsArray){
			if (polygonsArray.length != 0){
				polygonsArray[0].setMap(null);
				polygonsArray.length = 0;
			}
		}
		document.getElementById("radius").value = "";
		circle_center = 0;
		circle_radius = 0;
		circle_flag = false;

		circle_center_set = false;	//tada
	}
	
	if (poly_type == "rect"){
		pointsArray4Area = [];
		
		if (polygonsArray){
			if (polygonsArray.length != 0){
				polygonsArray[0].setMap(null);
				polygonsArray.length = 0;
			}
		}
		document.getElementById("rect_width").value = "";
		document.getElementById("rect_height").value = "";
		
		rect_start = 0;
		rect_end = 0;
		rect_flag = false;

		rect_start_set = false;		//tada
	}
	
	//document.getElementById("editable").checked = true;
	document.GoogleMapsContainer.conv_tani.options[2].selected = true;
	document.getElementById("tani").innerHTML = "㎡";
	
}

function clear_params_prev(prev_type) {
	document.getElementById("realaddress").value = "";
	
	document.getElementById("phonenumber").value = "";
	
	document.getElementById("calcarea").value = "";
	document.getElementById("meter_area").value = "";
	
	document.getElementById("compare_value").value = "";
	
	if (prev_type == "polyline"){
		pointsArray4Area = [];
		
		if (polygonsArray){
			if (polygonsArray.length != 0){
				for (var i=0;i< polygonsArray.length;i++){
					
					polygonsArray[i].setMap(null);
				}
			}
			
			polygonsArray.length = 0;
		}
	}
	
	if (prev_type == "circle"){
		pointsArray4Area = [];
		
		if (polygonsArray){
			if (polygonsArray.length != 0){
				polygonsArray[0].setMap(null);
				polygonsArray.length = 0;
			}
		}
		
		circle_center = 0;
		circle_radius = 0;
		circle_flag = false;
		
		
	}
	
	if (prev_type == "rect"){
		pointsArray4Area = [];
		
		if (polygonsArray){
			if (polygonsArray.length != 0){
				polygonsArray[0].setMap(null);
				polygonsArray.length = 0;
			}
		}
		
		rect_start = 0;
		rect_end = 0;
		rect_flag = false;
		
	}
	
	//document.getElementById("editable").checked = true;
	document.GoogleMapsContainer.conv_tani.options[2].selected = true;
	document.getElementById("tani").innerHTML = "㎡";
}


function value_compare(){
	var meters = document.getElementById("meter_area").value;
	var compare_type = document.getElementById("compare_type").value;
	
	if (compare_type == "tokyodome") {
		var base_unit = 46755;
		
	} else if (compare_type == "tokyodome") {
		var base_unit = 46755;
		
	} else if (compare_type == "koushien") {
		var base_unit = 38500;
		
	} else if (compare_type == "soccerfield") {
		var base_unit = 7140;
		
	} else if (compare_type == "usj") {
		var base_unit = 390000;
		
	} else if (compare_type == "tdl") {
		var base_unit = 510000;
		
	}
	
	
	
	var compare_value = meters / base_unit;
	compare_value = parseInt(compare_value * 10);
	compare_value = compare_value / 10;
	
	document.getElementById("compare_value").value = compare_value;
}

//***************************************************************************
function chk_radio(){
	for (var i = 0; i < document.GoogleMapsContainer.p_type.length; i++){
		if(document.GoogleMapsContainer.p_type[i].checked == true){
			if(document.GoogleMapsContainer.p_type[i].value == "circle"){
				poly_type = "circle";
				
				document.getElementById("explain").value = "地図上で２点をクリックして、半径で円を作成";
				
				document.getElementById("otherparam").innerHTML = '半径<input id="radius" size=25 value="" /><input type="text" id="radius_tani" style="border:0px" size=2 value="m">';
			
			}else if(document.GoogleMapsContainer.p_type[i].value == "rect"){
				poly_type = "rect";
				
				document.getElementById("explain").value = "地図上で２点をクリックして、対角線で矩形を作成";
				
				document.getElementById("otherparam").innerHTML = '横<input id="rect_width" size=11 value="" />ｘ縦<input id="rect_height" size=11 value="" /><input type="text" id="hen_tani" style="border:0px" size=2 value="m">';
				
			}else if(document.GoogleMapsContainer.p_type[i].value == "polyline"){
				poly_type = "polyline";
				
				document.getElementById("explain").value = "地図上でクリックして、エリアを作成";
				
				//document.getElementById("otherparam").innerHTML = '';
				document.getElementById("otherparam").innerHTML = '<input type="button" id="undo" onClick="polyDelPath()" value="追加取り消し" />';



			//append tada 外部データの取り込み　試験 tada
			}
			else if(document.GoogleMapsContainer.p_type[i].value == "outdata"){
				//初期化
				clear_params();

				//町内会データを強制的に外部データに置き換える
				var elm = document.getElementById("town_area").options;
				if(elm.length > 0 ){
					var ind = elm.selectedIndex;
					var town_name = elm[ind].value;

					if(!confirm("外部データとして「" + town_name + "」を取り込みますか？")){
						return;
					}

					//選択した町内会エリアのデータ polygons[name] を out_pointsArray4Areaに複写
					prev_poly_type = "polyline";
					poly_type = "polyline";

					out_pointsArray4Area = [];
					var telm = polygons[town_name];

					//先頭と末尾が同じ座標データでは、面積計算がエラーとなるため１個減算する
					var tlength = telm.length  -1 ;
					for(var i = 0 ; i < tlength ; i++){
						out_pointsArray4Area[i] = new google.maps.LatLng(telm[i].latitude , telm[i].longitude);
					}

					// 外部データの先頭位置にスクロールさせる
					googlemap.panTo(out_pointsArray4Area[0]);
				}



				switch(out_polytype){
					case "circle"   :
						prev_poly_type = "circle"; //強制的に変化なしとする
						poly_type = "circle";				
						circle_center = out_circle_center;
						circle_radius = out_circle_radius;
						circle_flag = true;


						document.getElementById("otherparam").innerHTML = '半径<input id="radius" size=25 value="" /><input type="text" id="radius_tani" style="border:0px" size=2 value="m">';
		
						document.getElementById("radius").value = circle_radius;

						set_circlePolygon();
						break;

					case "rect"     :
						prev_poly_type = "rect"; //強制的に変化なしとする
						poly_type= "rect";
						rect_start = out_rect_start;
						rect_end   = out_rect_end;
						rect_flag  = true;
				
						document.getElementById("otherparam").innerHTML = '横<input id="rect_width" size=11 value="" />ｘ縦<input id="rect_height" size=11 value="" /><input type="text" id="hen_tani" style="border:0px" size=2 value="m">';


						//辺の長さ表示
						var start_lat = rect_start.lat();
						var start_lng = rect_start.lng();
						var end_lat = rect_end.lat();
						var end_lng = rect_end.lng();
		
						var temp;
						//widthは同じ緯度の点を使う
						temp = new google.maps.LatLng(start_lat, end_lng);
						var rect_width = calc_betweenDistance(rect_start,temp);
				
						//heightは同じ経度の点を使う
						temp = new google.maps.LatLng(end_lat, start_lng);
						var rect_height = calc_betweenDistance(rect_start,temp);
		
						document.getElementById("rect_width").value = rect_width;
						document.getElementById("rect_height").value = rect_height;

						set_rectPolygon();
						break;

					case "polyline" :
						prev_poly_type = "polyline"; //強制的に変化なしとする
						poly_type="polyline";
													
						//配列の複写は、元の実体も変化する（関数作成）
						//pointsArray4Area = out_pointsArray4Area;
						pointsArray4Area = copyArray(out_pointsArray4Area);

						document.getElementById("otherparam").innerHTML = '<input type="button" id="undo" onClick="polyDelPath()" value="追加取り消し" />';

						set_polygon(pointsArray4Area,"","#ff0000",1);

						break;
				} 
				
				document.getElementById("explain").value = "外部データからエリアを作成";
				//document.getElementById("otherparam").innerHTML = '';

				var elm = document.GoogleMapsContainer;
				for (var i = 0; i < elm.p_type.length; i++){
					if(elm.p_type[i].value == poly_type){
						elm.p_type[i].checked = true;
					}
				}				
			}
			/////// tada

		}
	}
	
	if (prev_poly_type != poly_type){
		
		//初期化
		clear_params_prev(prev_poly_type);
		
		prev_poly_type = poly_type;
		
	}


}


//***************************************************************************

function set_Marker(clickedLocation,title,icon){
	var marker_icon = "";
	var anchor = "";
	var iconsize_x = 0;
	var iconsize_y = 0;


var sw = 2;

	//if (marker_type == "default"){
	if(title != "現在地"){
		//そのまま
		anchor = "lower";

		switch(icon){
			case 1 : marker_icon = 'images/red-dot.png';
				iconsize_x = 32;
				iconsize_y = 32;
				zindex = 1;
				break;
			case 2 : marker_icon = 'images/blue-dot.png';
				iconsize_x = 32;
				iconsize_y = 32;
				zindex = 2;
				break;
			case 3 : marker_icon = 'images/green-dot.png';
				iconsize_x = 32;
				iconsize_y = 32;
				zindex = 3;
				break;
			case 4 : marker_icon = 'images/yellow-dot.png';
				iconsize_x = 32;
				iconsize_y = 32;
				zindex = 4;
				break;
		}

	/*	
	}else if (marker_type == "custom1"){
		marker_icon = 'http://wisteriahill.sakura.ne.jp/GMAP/GMAP_MARKER/images/hand.png';
		anchor = "upper";
		iconsize_x = 46;
		iconsize_y = 50;
	*/	
	//}else if (marker_type == "custom2"){
	}else{
		//marker_icon = 'http://wisteriahill.sakura.ne.jp/GMAP/GMAP_MARKER/images/red1.png';
		marker_icon = 'images/red1.png';
		anchor = "middle";
		iconsize_x = 16;
		iconsize_y = 16;

		//
		var now_ind = markersArray.length -1;
		Q_point[now_ind] = [clickedLocation.lat(),clickedLocation.lng(),"現在地","",""];

	}


	var anim = "";
	//if (anim_type == "stable"){
		//そのまま
	//}else if (anim_type == "drop"){
		anim = google.maps.Animation.DROP;
	//}else if (anim_type == "bounce"){
	//	anim = google.maps.Animation.BOUNCE;
	//}
	
	//DROP,BOUNCE,animation プロパティが明示的に null に設定されるまでバウンドを続けます
	
	//var m_draggable = document.GoogleMapsContainer.m_drag.checked;
	var m_draggable = false;
	//alert(marker_icon);
	addMarker2(markersArray.length,clickedLocation.lat(),clickedLocation.lng(),marker_icon,iconsize_x,iconsize_y,title,m_draggable,true,anim,anchor,zindex);
}

function addMarker2(index,lat,lng,image,size_x,size_y,title,draggable,visible,anim,anchor,zindex){
	//alert(lat+"/"+lng+"/"+image+"/"+size_x+"/"+size_y+"/"+draggable+"/"+visible+"/"+anim+"/"+anchor);
	//アイコンの作成
	var marker_image = "";
	var anchor_x = 0;
	var anchor_y = 0;
	var animation = "";
	if (anim != ""){
		animation = anim;
	}
	
	if (image != ""){
		if (anchor == "lower"){
			anchor_x = size_x/2;
			anchor_y = size_y;
			
		}else if (anchor == "middle"){
			// デフォルトの先がとがったアイコンでない場合は、画像の中心がよいと思います。
			anchor_x = size_x/2;
			anchor_y = size_y/2;
			
		}else if (anchor == "upper"){
			anchor_x = size_x/2;
			anchor_y = 0;
			
		}else{
			anchor_x = size_x/2;
			anchor_y = size_y;
		}
		
		marker_image = new google.maps.MarkerImage(image,
		// イメージサイズ
		new google.maps.Size(size_x, size_y),
		// アイコンの起点
		new google.maps.Point(0,0),
		
		new google.maps.Point(anchor_x, anchor_y));
	}
	
	
	var marker = new google.maps.Marker({
		position: new google.maps.LatLng(lat,lng),
		map: googlemap,
		shadow: "",
		icon:marker_image,
		animation:animation,
		//shape: marker_shape,
		title:title,
		index:index,
		visible:visible,
		draggable : draggable,
		zIndex: zindex
	});
	
	google.maps.event.addListener(marker, "click", function() {
		
		marker_click(this);
		
	 
	});
	
	google.maps.event.addListener(marker, "dragend", function() {
		marker_dragend(this);
	 
	});

	markersArray.push(marker);
}


function chk_markertype(){
	for (var i = 0; i < document.GoogleMapsContainer.m_type.length; i++){
		if(document.GoogleMapsContainer.m_type[i].checked == true){
			if(document.GoogleMapsContainer.m_type[i].value == "default"){
				marker_type = "default";
				
			
			}else if(document.GoogleMapsContainer.m_type[i].value == "custom1"){
				marker_type = "custom1";
				
				
			}else if(document.GoogleMapsContainer.m_type[i].value == "custom2"){
				marker_type = "custom2";
				
				
			}
		}
	}
	

}

function chk_animtype(){
	for (var i = 0; i < document.GoogleMapsContainer.a_type.length; i++){
		if(document.GoogleMapsContainer.a_type[i].checked == true){
			if(document.GoogleMapsContainer.a_type[i].value == "stable"){
				anim_type = "stable";
				
				document.getElementById("b_stop").disabled = "disabled";
				//document.GoogleMapsContainer.b_stop.disabled = true;//無効にする
				
			}else if(document.GoogleMapsContainer.a_type[i].value == "drop"){
				anim_type = "drop";
				
				document.getElementById("b_stop").disabled = "disabled";
				//document.GoogleMapsContainer.b_stop.disabled = true;//無効にする
				
			}else if(document.GoogleMapsContainer.a_type[i].value == "bounce"){
				anim_type = "bounce";
				
				document.getElementById("b_stop").disabled = "";
				
				//document.GoogleMapsContainer.b_stop.disabled = false;//有効にする
			}
		}
	}
	
	

}


function marker_anim(){
	if (markersArray){
 		if (markersArray.length > 0){
			for(var i=0;i< markersArray.length;i++){
				var anim_type = markersArray[i].animation;
				
				if (anim_type == google.maps.Animation.BOUNCE){
					markersArray[i].setAnimation(null);
				}
				
			}
		}
	}
}

function clear_markers(){
	if (markersArray){
 		if (markersArray.length > 0){
			for(var i=0;i< markersArray.length;i++){
				markersArray[i].setMap(null);
				
			}
		}
	}
	
	markersArray.length = 0;
	document.getElementById("nodes").value = "";
}



//現在位置の取り込み	tada
function getNowLocation(sw){
	// gps に対応しているかチェック
	if (! navigator.geolocation) {
		//$('#googlemap').text('GPSに対応したブラウザでお試しください');
		alert("GPS等位置情報に対応したブラウザでお試しください");
		return false;
	}
 
	//googlemap.text = 'GPSデータを取得します...';
 
	// gps取得開始
	navigator.geolocation.getCurrentPosition(function(G_pos) {

/*
	//町会データで比較
		place_name = whereIsPointInsidePolygon(G_pos.coords.latitude, G_pos.coords.longitude);

		var not_found = (place_name === '');
		if(not_found) {
			alert('現在地情報が取得できませんでした');
			return;
		}
*/
		// gps 取得成功
		var nowLatLng = new google.maps.LatLng(G_pos.coords.latitude, G_pos.coords.longitude);

		// 現在位置にピンをたてる
		//マーカ形状やドラッグの可否条件は、画面の設定による
		set_Marker(nowLatLng,"現在地",0);

		// 現在地にスクロールさせる
		googlemap.panTo(nowLatLng);

		//center line 再表示
		map_center = nowLatLng;
		v_line.setPosition(map_center.lat(),map_center.lng());
    		h_line.setPosition(map_center.lat(),map_center.lng());

		//座標データの再設定
 		var cont = "";
		for(var i=0;i< markersArray.length;i++){
			var pos = markersArray[i].getPosition();
			//alert(pos);
			cont += pos.lat() + "," + pos.lng() + "\n";
		}
		//document.getElementById("nodes").value = cont;

		if(sw == 2){
			document.getElementById("start_point").value = map_center.lat() + "," + map_center.lng();
		}else{
			document.getElementById("arive_point").value = map_center.lat() + "," + map_center.lng();
		}
	//});


	}, function() {
        	// gps 取得失敗
        	alert('現在地情報を取得できませんでした。ご利用端末の設定を確認してください。');
        	return false;
	});
}


//*********************************
//配列複写の関数	tada
function copyArray(arry){
	var tempArray = [];
	for(var i=0; i<arry.length ; i++){
		if(arry[i] instanceof Array){
			tempArray[i] = copyArray(arry[i]);
		}else{
			tempArray[i] = arry[i];
		}
	}
	return tempArray;
}



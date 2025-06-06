// 지도 생성 및 기본 설정
var container = document.getElementById('map');
var options = {
    center: new kakao.maps.LatLng(37.379543, 126.928904),
    level: 3
};
var map = new kakao.maps.Map(container, options);

// 지도 컨트롤 설정
var mapTypeControl = new kakao.maps.MapTypeControl();
map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
var zoomControl = new kakao.maps.ZoomControl();
map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);
map.addOverlayMapTypeId(kakao.maps.MapTypeId.TERRAIN);

// 주소 변환 객체
var geocoder = new kakao.maps.services.Geocoder();

// 지도 중심 주소 표시
kakao.maps.event.addListener(map, 'idle', function () {
    searchAddrFromCoords(map.getCenter(), displayCenterInfo);
});

function searchAddrFromCoords(coords, callback) {
    geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
}

function displayCenterInfo(result, status) {
    if (status === kakao.maps.services.Status.OK) {
        var infoDiv = document.getElementById('centerAddr');
        for (var i = 0; i < result.length; i++) {
            if (result[i].region_type === 'H') {
                infoDiv.innerHTML = result[i].address_name;
                break;
            }
        }
    }
}

// 클릭 마커와 주소 출력
var clickMarker = new kakao.maps.Marker();
var clickInfowindow = new kakao.maps.InfoWindow({ zindex: 1 });

kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
    var latlng = mouseEvent.latLng;
    geocoder.coord2Address(latlng.getLng(), latlng.getLat(), function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var detailAddr = '';
            var regionName = '';

            if (result[0].road_address) {
                detailAddr += '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>';
            }
            detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';

            regionName = result[0].address.region_3depth_name;

            var content = '<div class="bAddr"><span class="title">' + regionName + ' 주소</span>' + detailAddr + '</div>';
            clickMarker.setPosition(latlng);
            clickMarker.setMap(map);
            clickInfowindow.setContent(content);
            clickInfowindow.open(map, clickMarker);

            document.getElementById('clickLatlng').innerHTML =
                '클릭한 위치의 위도는 ' + latlng.getLat() + ' 이고, 경도는 ' + latlng.getLng() + ' 입니다';
        }
    });
});

// 장소 검색
var markers = [];
var ps = new kakao.maps.services.Places();
var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });
searchPlaces();

function searchPlaces() {
    var keyword = document.getElementById('keyword').value;
    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }
    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);
        displayPagination(pagination);
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 존재하지 않습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
    }
}

function displayPlaces(places) {
    var listEl = document.getElementById('placesList'),
        menuEl = document.getElementById('menu_wrap'),
        fragment = document.createDocumentFragment(),
        bounds = new kakao.maps.LatLngBounds();

    removeAllChildNods(listEl);
    removeMarker();

    for (var i = 0; i < places.length; i++) {
        var placePosition = new kakao.maps.LatLng(places[i].y, places[i].x),
            marker = addMarker(placePosition, i),
            itemEl = getListItem(i, places[i]);

        bounds.extend(placePosition);

        (function (marker, title) {
            kakao.maps.event.addListener(marker, 'mouseover', function () {
                displayInfowindow(marker, title);
            });
            kakao.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close();
            });
            itemEl.onmouseover = function () {
                displayInfowindow(marker, title);
            };
            itemEl.onmouseout = function () {
                infowindow.close();
            };
        })(marker, places[i].place_name);

        fragment.appendChild(itemEl);
    }

    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;
    map.setBounds(bounds);
}

function getListItem(index, places) {
    var el = document.createElement('li'),
        itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
            '<div class="info">' +
            '<h5>' + places.place_name + '</h5>';

    if (places.road_address_name) {
        itemStr += '<span>' + places.road_address_name + '</span>' +
            '<span class="jibun gray">' + places.address_name + '</span>';
    } else {
        itemStr += '<span>' + places.address_name + '</span>';
    }

    itemStr += '<span class="tel">' + places.phone + '</span></div>';
    el.innerHTML = itemStr;
    el.className = 'item';
    return el;
}

function addMarker(position, idx, title) {
    var imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
        imageSize = new kakao.maps.Size(36, 37),
        imgOptions = {
            spriteSize: new kakao.maps.Size(36, 691),
            spriteOrigin: new kakao.maps.Point(0, (idx * 46) + 10),
            offset: new kakao.maps.Point(13, 37)
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
        marker = new kakao.maps.Marker({
            position: position,
            image: markerImage
        });

    marker.setMap(map);
    markers.push(marker);
    return marker;
}

function removeMarker() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}

function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i;

    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild(paginationEl.lastChild);
    }

    for (i = 1; i <= pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i === pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function (i) {
                return function () {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

function displayInfowindow(marker, title) {
    geocoder.coord2Address(marker.getPosition().getLng(), marker.getPosition().getLat(), function(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var detailAddr = !!result[0].road_address ? '<div>도로명주소 : ' + result[0].road_address.address_name + '</div>' : '';
            detailAddr += '<div>지번 주소 : ' + result[0].address.address_name + '</div>';

            var content = '<div style="padding:5px;z-index:1;"><strong>' + title + '</strong><br>' + detailAddr + '</div>';
            infowindow.setContent(content);
            infowindow.open(map, marker);
        }
    });
}

function removeAllChildNods(el) {
    while (el.hasChildNodes()) {
        el.removeChild(el.lastChild);
    }
}
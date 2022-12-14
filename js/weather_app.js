//WEATHER APP
//OPEN WEATHER API
//JQUERY
//MAPBOX
(function (){
    "use strict"
    console.log('testing connection');
    function renderRightNow(weatherData, data){
        let html = '';
        html +=
            '               <div class="right-now">\n' +
            '                    <div class="container text-center ">\n' +
            '                        <div class="row">\n' +
            '                            <div class="col shadow-sm p-3 rounded bg-opacity-25 text-white bg-primary">\n' +
            '                                <h6 class="pt-4">Right now</h6>\n' +
            '                                <large>' + data['city']['name'] + '</large>\n' +
            '                                <figure>\n' +
            `                                    <div id="icon"><img src="http://openweathermap.org/img/wn/${weatherData[0][0]['weather'][0]['icon']}.png"></div>\n` +
            '                                    <figcaption>' + weatherData[0][0]['main']['temp']+ ' F<span>&#176</span>' + '</figcaption>\n' +
            '                                </figure>\n' +
            '                            </div>\n' +
            '                            <div class="col-8 ms-2 shadow-sm p-3 rounded">\n' +
            '                                <div class="stats">\n' +
            '                                   <p class="text-primary">' + weatherData[0][0]['weather'][0]['description'] + '</p>\n' +
            '                                   <p>Humidity: ' + weatherData[0][0]['main']['humidity'] + '%' + '</p>\n' +
            '                                   <p>Wind-Speed: ' + weatherData[0][0]['wind']['speed'] + ' mph' + '</p>\n' +
            '                                   <p>Pressure: ' + weatherData[0][0]['main']['pressure'] + '</p>\n' +
            '                                </div>\n' +
            '                            </div>\n' +
            '                        </div>\n' +
            '                    </div>\n' +
            '                </div>'
        return html;
    }
    // create structure of data in a table format on HTML file and in function
    // loop through format to display forecast for each day
    function renderHTML(weatherData){
        let html = '';
        // console.log(`http://openweathermap.org/img/w/${weatherData[i][0]['weather'][0]['id']}.png`);
        for(let i = 1; i < weatherData.length ; ++i){
            html +=
                '                 <div class="weather-stats">\n' +
                '                    <div class="container text-center mb-2">\n' +
                '                        <div class="row">\n' +
                '                            <div class="col rounded shadow-sm p-3 bg-opacity-25 text-white bg-primary">\n' +
                '                                <h6 class="pt-4">'+weatherData[i][0]["dt_txt"] +'</h6>\n' +
                '                                <figure>\n' +
                `                                    <div id="icon"><img src="http://openweathermap.org/img/wn/${weatherData[i][0]['weather'][0]['icon']}.png"></div>\n` +
                '                                    <figcaption>'+ weatherData[i][0]['main']['temp'] + ' F<span>&#176</span></figcaption>\n' +
                '                                </figure>\n' +
                '                            </div>\n' +
                '                            <div class="col-8 ms-2 shadow-sm p-3 rounded">\n' +
                '                                <div class="stats">\n' +
                '                                   <p class="text-primary">' + weatherData[i][0]['weather'][0]['description']+ '</p>\n' +
                '                                   <p>Humidity: ' + weatherData[i][0]['main']['humidity'] + '</p>\n' +
                '                                   <p>Wind-Speed: ' + weatherData[i][0]['wind']['speed'] + '</p>\n' +
                '                                   <p>Pressure: ' + weatherData[i][0]['main']['pressure']+ '</p>\n' +
                '                                </div>\n' +
                '                            </div>\n' +
                '                        </div>\n' +
                '                    </div>';
        }
        return html;
    }
    // Separates weather data from all other datasets in JSON object from OpenWeather API
    function fiveDayForeCast(weatherData){
        // stores weather 3hr weather forecast in binding
        let forecast = weatherData['list'];
        let five_day_forecast = [];
        // iterate through 3hr weather array to convert to a day format of 3hr forecast for next 5-days
        while(forecast.length){
            // create empty array to act as temporary storage to transfer to 5-day forecast array
            let day_forecast = [];
            // conditional to control flow of while loop for one DAY
            if(forecast.length % 8 === 0) {
                // REMOVE first 8 indexes/elements from forecast array & ADD them 5-day forecast array
                day_forecast = forecast.splice(0, 8);
                five_day_forecast.push(day_forecast);
                //counter for while loop to eventually terminate
                forecast.length - 8;
            }else {
                // Break if forecast length is not divisible by 8
                break;
            }
        }
        return five_day_forecast;
    }
    // submission button event that triggers the geocode which turns typed address into lat-long coordinates
    $('#btn').on('click', event =>{
        // search functionality convert name into lat long
        geocode(`${jsonData['address']}`, MAPBOX_TOKEN_OPEN_WEATHER).then(function(result) {
            delete jsonData['address'];
            map.setCenter(result);
            map.setZoom(7);
            marker.setLngLat([result[0],result[1]]);
        });
    });
    // create marker via @OpenWeather API
    const marker = new mapboxgl.Marker({
        draggable: true
    })
        .setLngLat([-96.775621, 32.817754])
        .addTo(map);

    // creates functionality which returns lat-long when event is triggers by the way of the marker
    function onDragEnd() {
        const lngLat = marker.getLngLat();
        coordinates.style.display = 'block';
        coordinates.innerHTML = `Longitude: ${lngLat.lng}<br />Latitude: ${lngLat.lat}`;
        $.get('https://api.openweathermap.org/data/2.5/forecast',{
            appid: WEATHER_APP_ID,
            lon: lngLat.lng, //resultsLong
            lat: lngLat.lat, //resultsLat
            units: 'imperial',
        }).done(function (data){
            // Rendering all HTML
            let weatherData = fiveDayForeCast(data);
            let rightNowHTML = renderRightNow(weatherData, data);
            let fiveDayForeCastHTML = renderHTML(weatherData);
            $('.weather-stats').html(fiveDayForeCastHTML);
            marker.on('dragend', $('.right-now').html(rightNowHTML));
            $('#btn').on('click', onDragEnd);
        }).fail(function (error){
            console.log(error);
        })
        // converts lat-long to physical address
        reverseGeocode(marker.getLngLat() ,MAPBOX_TOKEN_OPEN_WEATHER )
            .then(function(results) {
                // converts physical address to lat long
                geocode(results, MAPBOX_TOKEN_OPEN_WEATHER).then(function(result) {
                    map.setCenter(result);
                    map.setZoom(7);
                });
            });
    }
    // marker drag event that triggers capture of lat-long
    marker.on('dragend', onDragEnd);



})();
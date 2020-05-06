var apiKey = "79d4f96b77f1e8ddc1e1ddb983739bcb";

$(document).ready(function(){
    updateSearchHistory();
});

$("#search-btn").click(function(){
    loadCurrentWeather($("#city-search").val());
});
function updateSearchHistory(){
    var $searchHistory = $("#search-history");
    $searchHistory.html("");
    for(var i = 0; i < localStorage.length; i++){
        var cityName = localStorage.key(i);
        var $cityButton = $("<button>");
        $cityButton.addClass("list-group-item list-group-item-action");
        $cityButton.text(cityName);
        $cityButton.data("city", cityName);
        $cityButton.click(function(){
            loadCurrentWeather($(this).data("city"));
        });
        $searchHistory.append($cityButton);
    }
}

function kelvinToFarenheit(k){
    return (k - 273.15) * 9/5 + 32;
}
function metersPerSecToMilesPerHour(s){
    return s * 2.237;
}
function loadCurrentWeather(cityName){
    $.ajax({
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&APPID=" + apiKey,
        method:"GET",
        success: function (data){
            localStorage.setItem(data.name,data.name);
            updateSearchHistory();
            $("#city-name").text(data.name);
            var temp = kelvinToFarenheit(data.main.temp);
            $("#current-temp").html("Temperature: " + temp.toFixed(1) + "&deg;F");
            $("#current-humidity").text("Humidity: " + data.main.humidity +"%");
            var windspeed = metersPerSecToMilesPerHour(data.wind.speed);
            $("#current-wind-speed").text("Wind Speed: " + windspeed.toFixed(1) + " MPH");
            load5DayForecast(data.name);
        },
        error: function (data){
            console.log("error",data);
        }
    });
}

function load5DayForecast(cityName) {
    $.ajax({
        url:"https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&APPID=" + apiKey,
        method:"GET",
        success:function(forecast){
            var today = moment().endOf("day");
            var daysSeen = {};
            var $forecast = $("#forecast");
            $forecast.html('');
            for(var i = 0; i< forecast.list.length;i++){
                var item = forecast.list[i];
                var date = moment(item.dt * 1000);
                var startOfDate = moment(date).startOf("day").format();
                if(date.isAfter(today) && !daysSeen[startOfDate] && date.hour()>=12){
                    daysSeen[startOfDate]= true;
                    console.log(item);
                    var $col = $("<div>");
                    $col.addClass("col");

                    var $card = $("<div>");
                    $card.addClass("card text-white bg-primary mr-3");

                    var $cardBody = $("<div>");
                    $cardBody.addClass("card-body");

                    var $cardTitle = $("<h5>");
                    $cardTitle.addClass("card-title");
                    $cardTitle.text(date.format("MM/DD/YYYY"));
                    $cardBody.append($cardTitle);

                    var $icon = $("<img>");
                    $icon.addClass("img-fluid");
                    $icon.attr("src", "https://openweathermap.org/img/wn/" + item.weather[0].icon + ".png");
                    $icon.attr("alt", item.weather[0].description);
                    $cardBody.append($icon);

                    var $tempText = $("<p>");
                    $tempText.addClass("card-text");

                    var temp = kelvinToFarenheit(item.main.temp);
                    $tempText.html("Temp: " + temp.toFixed(1) + "&deg;F");
                    $cardBody.append($tempText);

                    var $humidityText = $("<p>");
                    $humidityText.addClass("card-text");
                    $humidityText.text("Humidity: " + item.main.humidity +"%");

                    $cardBody.append($humidityText);
                    $card.html($cardBody);
                    $col.html($card);
                    $forecast.append($col);
                }
            }
        },
        error:function(err){
            console.log("error",err);
        }
    });
}

var updateTrains = function($scope) {
  $("#waiting").show();

  var
    origin = $("#origin").text(),
    destination = $("#destination").text(),
    day = $("#day").text().replace(/\//g,"-"),
    hour = $("#hour").text();

  console.log(origin, destination, day, hour)

  $.getJSON("/" + origin + "/" + destination + "/" + day + "/" + hour + "?json")
  .success(function(data) {
      $scope.$apply(function() {
        $scope.trains = data;
      })
      $("#waiting").hide();
  })
  .error(function(err) {
    console.log(err.data)
  })
}
updateTrains = _.debounce(updateTrains, 1200)

var trainCtrl = function($scope) {
    $scope.trains = trains
    console.log(trains)


    $(".editable").keypress(function(event) {
      if (event.which == 13) {
        event.preventDefault()
      }
      else {
        updateTrains($scope);
      }
    });
}
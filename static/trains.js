var
  time = 1200,
  complete = {"width" : "100%", "visibility" : "visible", "transition" : "0s"},
  finished = {"transition-property" : "width", "transition" : time + "ms width linear", "width" : "16px"},

  updateTrains = function($scope) {
    $("hr").css("visibility", "hidden");
    $("#waiting").css("visibility", "visible");

    var
      origin = $("#origin").text(),
      destination = $("#destination").text(),
      day = $("#day").text().replace(/\//g,"-"),
      hour = $("#hour").text(),
      url = "/" + origin + "/" + destination + "/" + day + "/" + hour;

    $.getJSON(url + "?json")
    .success(function(data) {
      $scope.$apply(function() {
        $scope.trains = data;
        var title = origin + " - " + destination + " le " + day + " à " + hour + "h";
            url = url;
        history.pushState(null, origin + " - " + destination + " le " + day + " à " + hour + "h", url)
      })
      $("#waiting").css("visibility", "hidden");
      $("hr").css(complete);
    })
    .error(function(err) {
      console.log(err.data)
    })
  },

  updateTrainsDebounced = _.debounce(updateTrains, time),

  trainCtrl = function($scope) {
    $scope.trains = trains

    $(".editable").keypress(function(event) {
      if (event.which == 13) {
        event.preventDefault();
        updateTrains($scope);
      }
      else {
        updateTrainsDebounced($scope);
        var $hr = $("hr");
        $hr.css(complete);
        setTimeout(function () { $hr.css(finished) }, 5);
      }

    });

    $(function () {
      $("#origin").focus();
      updateTrains($scope);
    });
  }
;

var resetScrapDate = function (permalink) {
    console.log('Reseting Next Scrap Date for "' + permalink + '"');


    $.ajax({
        type: "POST",
        url: "http://208.110.70.2:3010/api/leagues/scrap/reset/" + permalink,
        // url: "http://localhost:3010/api/leagues/scrap/reset/" + permalink,
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        dataType: "json",
        success: function (data, status, jqXHR) {
            location.reload();
        },

        error: function (jqXHR, status) {
            // error handler
            console.log(jqXHR);
        }
    });

}
// Width/depth in tiles
var WIDTH = 25;

var selectedTile = null;

// Map of tile types to images
var tileImages =
{
    'empty-tile': 'tiles/empty_tex.png',
    'jail-tile':  'tiles/jail_tex.png',
    'wall-tile':  'tiles/wall_tex.png',
    'fence-tile': 'tiles/fence_tex.jpeg'
}

// Build empty game map once document is loaded
$(document).ready(function() {
    // Clears and refills map with empty tiles
    $("#clear-btn").click(function() {
        var mapCtr = $("#map-container");
        mapCtr.empty();
        emptyFill(mapCtr);
    });

    // Exports map as line-separated tiles
    $("#save-btn").click(function() {
        exportMapToFile($("#map-container"));
    });

    // Imports map
    document.getElementById('load-btn').addEventListener('change', loadMapFromFile, false);

    // Add tiles to sidebar
    for (var key in tileImages) {
        $("#sidebar").append("<div id=\"" + key + "\" class=\"sidebar-tile\"><img src=\"" + tileImages[key] + "\"></div>");
    }

    // Select specified tile on click
    $(".sidebar-tile").click(function() {
        $(".sidebar-tile").removeClass("tile-selected");
        $(this).addClass("tile-selected");
        selectedTile = $(this);
    });

    // Resize map container on resize and load
    $(window).on("resize", function() {
        var mapCtr = $("#map-container");
        mapCtr.width(mapCtr.height());

        // Resize tiles on map
        $(".map-tile").css("width", mapCtr.width()/WIDTH);
        $(".map-tile").css("height", mapCtr.width()/WIDTH);
    }).resize()

    // Fill map with empty tiles
    emptyFill($("#map-container"));
});


// Fills map with empty white squares
function emptyFill(mapCtr) {
    for (i = 0; i < WIDTH*WIDTH; i++) {
        // Fence around border
        if (i < WIDTH || i >= WIDTH*(WIDTH-1) || i % WIDTH == 0 || i % WIDTH == WIDTH - 1) {
            mapCtr.append("<div class=\"map-tile fence-tile\"><img src=\"" + tileImages['fence-tile'] + "\"></div>");
        }
        // Empty tiles otherwise
        else {
            mapCtr.append("<div class=\"map-tile empty-tile\"><img src=\"" + tileImages['empty-tile'] + "\"></div>");
        }
    }

    // Fit to container
    $(".map-tile").css("width", mapCtr.width()/WIDTH);
    $(".map-tile").css("height", mapCtr.width()/WIDTH);

    registerMapListeners();
}

// Registers all necessary listeners
function registerMapListeners() {
    // Change tile on map
    $(".map-tile").mousedown(function(e) {
        if (e.which == 1) { // Left mouse button pressed
            $(this).removeClass();
            $(this).addClass("map-tile");

            if (selectedTile)
            {
                var tileId = selectedTile.attr('id');
                $(this).find("img").attr("src", tileImages[tileId]);
                $(this).addClass(tileId);
            }
        }
        else if (e.which == 3) { // Right mouse button pressed
            $(this).removeClass();
            $(this).addClass("map-tile");
            $(this).find("img").attr("src", tileImages['empty-tile']);
            $(this).addClass("empty-tile");
        }
    });
}

// Exports map to file
function exportMapToFile(mapCtr) {
    tileArray = [];
    $(mapCtr).children().each(function() {
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            if (item !== 'map-tile') {
                tileArray.push(item);
            }
        });
    });

    var a = document.createElement("a");
    var file = new Blob([tileArray.join("\n")], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'map.txt';
    a.click();
}

// Loads map from file
function loadMapFromFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
        var mapCtr = $("#map-container");
        mapCtr.empty();

        var contents = e.target.result;
        tileArray = contents.split("\n");

        for (var i = 0; i < tileArray.length; i++) {
            tileType = tileArray[i];
            mapCtr.append("<div class=\"map-tile " + tileType + "\"><img src=\"" + tileImages[tileType] + "\"></div>");
        }

        // Fit to container
        $(".map-tile").css("width", mapCtr.width()/WIDTH);
        $(".map-tile").css("height", mapCtr.width()/WIDTH)

        registerMapListeners();
    };
    reader.readAsText(file);
}

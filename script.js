// Width/depth in tiles
var WIDTH = 25;

var selectedTile = null;

// Build empty game map once document is loaded
$(document).ready(function() {
    // Clears and refills map with empty tiles
    $("#clear-btn").click(function() {
        var mapCtr = $("#map-container");
        mapCtr.empty();
        emptyFill(mapCtr);
    });

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

    // Fill with empty tiles
    emptyFill($("#map-container"));
});


// Fills map with empty white squares
function emptyFill(mapCtr) {
    for (i = 0; i < WIDTH*WIDTH; i++) {
        // Wall around border
        if (i < WIDTH || i >= WIDTH*(WIDTH-1) || i % WIDTH == 0 || i % WIDTH == WIDTH - 1) {
            mapCtr.append("<div class=\"map-tile wall-tile\"><img src=\"tiles/wall_tex.png\"></div>");
        }
        // Empty tiles otherwise
        else {
            mapCtr.append("<div class=\"map-tile empty-tile\"><img src=\"tiles/empty_tex.png\"></div>");
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
    $(".map-tile").click(function() {
        $(this).removeClass();
        $(this).addClass("map-tile");

        // Switch on currently selected tile
        if (selectedTile)
        {
            var tileId = selectedTile.attr('id');
            if (tileId === "empty-tile")
            {
                $(this).find("img").attr("src", "tiles/empty_tex.png");
                $(this).addClass("empty-tile");
            }
            else if (tileId === "jail-tile")
            {
                $(this).find("img").attr("src", "tiles/jail_tex.png");
                $(this).addClass("jail-tile");
            }
            else if (tileId === "wall-tile")
            {
                $(this).find("img").attr("src", "tiles/wall_tex.png");
                $(this).addClass("wall-tile");
            }
        }
    });
}

// Width/depth in tiles
var WIDTH = 11;

var selectedTile = null;
var hoveredTile = null;

// Map of tile types to images
var tileImages =
{
    'empty-tile': 'tiles/empty_tex.png',
    'jail-tile':  'tiles/jail_tex.png',
    'wall-tile':  'tiles/wall_tex.png',
    'fence-tile': 'tiles/fence_tex.png'
}

// Mouse buttons
var leftClicked = false;
var rightClicked = false;

// Keys
var escPressed = false;
var spacePressed = false;

// Build empty game map once document is loaded
$(document).ready(function() {
    // Clears and refills map with empty tiles
    $("#clear-btn").click(function() {
        $(this).blur(); // Unfocus button
        var mapCtr = $("#map-container");
        mapCtr.empty();
        emptyFill(mapCtr);
    });

    // Exports map as line-separated tiles
    $("#save-btn").click(function() {
        $(this).blur(); // Unfocus button
        exportMapToFile($("#map-container"));
    });

    // Imports map
    document.getElementById('load-btn').addEventListener('change', loadMapFromFile, false);

    // Add tiles to sidebar
    for (var key in tileImages) {
        $("#tile-selection").append("<div id=\"" + key + "\" class=\"sidebar-tile\"><img src=\"" + tileImages[key] + "\"></div>");
    }

    // Keyboard handling
    $(document).keydown(function(e) {
        if (hoveredTile != null) {
            if (e.which == 82) { // 'r' rotates tile
                rotateTile(hoveredTile);
            }
            else if (e.which == 27) { // ESC clears tile
                changeTile(hoveredTile, false, true);
                escPressed = true;
            }
            else if (e.which == 32) { // SPACE places tile
                changeTile(hoveredTile, true, false);
                spacePressed = true;
            }
        }
    });

    $(document).keyup(function(e) {
        if (e.which == 27) { // escape
            escPressed = false;
        }
        else if (e.which == 32) { // space
            spacePressed = false;
        }
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

    $("#map-container").mousedown(function(e) {
        if (e.which == 1) {
            leftClicked = true;
        }
        else if (e.which == 3) {
            rightClicked = true;
        }
    });

    $("#map-container").mouseup(function(e) {
        if (e.which == 1) {
            leftClicked = false;
        }
        else if (e.which == 3) {
            rightClicked = false;
        }
    });

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
    // Handlers for dragging
    $(".map-tile").mousemove(function() {
        changeTile($(this), leftClicked || spacePressed, rightClicked || escPressed);
    });

    // Handlers for clicking
    $(".map-tile").mousedown(function(e) {
        if (e.which == 1) { // Left mouse button
            changeTile($(this), true, false);
        }
        else if (e.which == 2) { // Middle mouse button
            rotateTile($(this));
        }
        else if (e.which == 3) { // Right mouse button
            changeTile($(this), false, true);
        }
    });

    // See which element is being hovered over
    $(".map-tile").hover(function() {
        hoveredTile = $(this);
    });

    // Handler for keypresses
    $(".map-tile").keydown(function() {
        alert($(this).attr('class'));
    });
}

function changeTile(tile, leftMouse, rightMouse) {
    // Change tile on map
    if (leftMouse) {
        tile.css("transform", "");
        tile.removeClass();
        tile.addClass("map-tile");

        if (selectedTile)
        {
            var tileId = selectedTile.attr('id');
            tile.find("img").attr("src", tileImages[tileId]);
            tile.addClass(tileId);
        }
    }
    else if (rightMouse) { // Right mouse button pressed
        tile.css("transform", "");
        tile.removeClass();
        tile.addClass("map-tile");
        tile.find("img").attr("src", tileImages['empty-tile']);
        tile.addClass("empty-tile");
    }
}

function rotateTile(tile) {
    // Change tile on map
    var prevAngle = parseRotationAngle(tile.css("transform"));
    var newAngle = (prevAngle + 90) % 360;
    if (newAngle != 0) {
        tile.css("transform", "rotate(" + newAngle + "deg)");
    }
    else {
        tile.css("transform", "");
    }
}

function parseRotationAngle(matrix) {
    if (matrix == "none") {
        return 0;
    }
    var values = matrix.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));

    return (angle < 0) ? angle + 360 : angle;
}

// Exports map to file
function exportMapToFile(mapCtr) {
    tileArray = [];
    $(mapCtr).children().each(function() {
        tile = $(this);
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            if (item !== 'map-tile') {
                // Also get rotation
                var angle = parseRotationAngle(tile.css("transform"));
                tileArray.push([item,angle]);
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
            var splitContents = tileArray[i].split(",");
            var tileType = splitContents[0];
            var rotation = splitContents[1];
            mapCtr.append("<div class=\"map-tile " + tileType + "\"><img src=\"" + tileImages[tileType] + "\"></div>");
            mapCtr.children().last().css("transform", "rotate(" + rotation + "deg)");
        }

        // Fit to container
        $(".map-tile").css("width", mapCtr.width()/WIDTH);
        $(".map-tile").css("height", mapCtr.width()/WIDTH)

        registerMapListeners();

        // Clear "choose file" dialog and unfocus it
        $("#load-btn").val(null);
        $("#load-btn").blur();
    };
    reader.readAsText(file);
}

// Width/depth in tiles
var WIDTH = 32;

// Entity tiles
var selectedEntityTile = null;
var hoveredTile = null;

// Ground tiles
var selectedGroundTile = null;
var defaultGroundColor = null;

// Map of tile types to images
var tileImages =
{
    // [index, tile_image, width (tiles), depth (tiles)]
    'empty-tile': [0, 'tiles/entity/empty_tex.png', 1, 1],
    'jail-tile':  [1, 'tiles/entity/jail_tex.png', 1, 1],
    'wall-tile':  [2, 'tiles/entity/wall_tex.png', 1, 1],
    'fence-tile': [3, 'tiles/entity/fence_tex.png', 1, 1],
    'human-spawn-tile': [4, 'tiles/entity/human_tex.png', 1, 1],
    'dog-spawn-tile': [5, 'tiles/entity/dog_tex.png', 1, 1],
    'house-6x6-A-tile': [6, 'tiles/entity/house-6x6-A_tex.png', 4, 4],
    'dogbone-tile': [7, 'tiles/entity/dogbone_tex.png', 1, 1],
    'doghouse-tile': [8, 'tiles/entity/doghouse_tex.png', 1, 1],
    'firehydrant-tile': [9, 'tiles/entity/firehydrant_tex.png', 1, 1],
    'fountain-tile': [10, 'tiles/entity/fountain_tex.png', 3, 3]
}

// First type of ground is default
var groundTiles =
{
    // [index, tile_image, color]
    'grass-ground': [0, 'tiles/ground/grass.png', 'rgb(210, 255, 173)'], // Light green
    'road-ground': [1, 'tiles/ground/road.png', 'rgb(175, 175, 175)'], // Light gray
    'dirt-ground': [2, 'tiles/ground/dirt.png', 'rgb(181, 101, 29)'] // Light brown
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

    // Add entity tiles to sidebar
    for (var key in tileImages) {
        $("#tile-selection").append("<div id=\"" + key + "\" class=\"sidebar-tile entity-tile\"><img src=\"" + tileImages[key][1] + "\"></div>");
    }

    // Add ground tiles to sidebar
    for (var key in groundTiles) {
        $("#ground-selection").append("<div id=\"" + key + "\" class=\"sidebar-tile ground-tile\"><img src=\"" + groundTiles[key][1] + "\"></div>");
        $("#ground-selection").children().last().css("background-color", groundTiles[key][2]);
    };

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

    // Select specified entity tile on click
    $(".entity-tile").click(function() {
        $(".entity-tile").removeClass("tile-selected");
        $(this).addClass("tile-selected");
        selectedEntityTile = $(this);
    });

    // Select specified ground tile on click
    $(".ground-tile").click(function() {
        $(".ground-tile").removeClass("tile-selected");
        $(this).addClass("tile-selected");
        selectedGroundTile = $(this);
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
    // Select first ground tile by default
    $(".ground-tile").removeClass("tile-selected");
    $("#ground-selection").children().first().addClass("tile-selected");
    selectedGroundTile = $("#ground-selection").children().first();
    defaultGroundColor = selectedGroundTile.css("background-color")

    for (i = 0; i < WIDTH*WIDTH; i++) {
        // Fence around border
        if (i < WIDTH || i >= WIDTH*(WIDTH-1) || i % WIDTH == 0 || i % WIDTH == WIDTH - 1) {
            mapCtr.append("<div class=\"map-tile fence-tile\"><img src=\"" + tileImages['fence-tile'][1] + "\"></div>");
        }
        // Empty tiles otherwise
        else {
            mapCtr.append("<div class=\"map-tile empty-tile\"><img src=\"" + tileImages['empty-tile'][1] + "\"></div>");
        }
    }

    // Fit to container
    $(".map-tile").css("width", mapCtr.width()/WIDTH);
    $(".map-tile").css("height", mapCtr.width()/WIDTH);

    // Set background to default ground texture
    $(".map-tile").css("background-color", selectedGroundTile.css("background-color"));

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
        if (selectedEntityTile)
        {
            var tileId = selectedEntityTile.attr('id');
            var tileInfo = tileImages[tileId];

            // Get index
            var index = tile.index();
            var xIndex = index % WIDTH;
            var zIndex = Math.floor(index / WIDTH);

            var structWidth = tileInfo[2];
            var structDepth = tileInfo[3];

            // Abort if our structure won't fit
            if (xIndex + structWidth - 1 >= WIDTH ||
                zIndex + structDepth - 1 >= WIDTH) {
                return;
            }

            // Set tile attributes for each tile in range
            for (var i = zIndex; i < zIndex + structDepth; i++) {
                for (var j = xIndex; j < xIndex + structWidth; j++) {
                    var curTile = $("#map-container").children().eq(i * WIDTH + j);

                    curTile.css("transform", "");
                    curTile.removeClass();
                    curTile.addClass("map-tile");

                    curTile.find("img").attr("src", tileImages[tileId][1]);
                    curTile.addClass(tileId);

                    // Background according to selected ground texture
                    curTile.css("background-color", selectedGroundTile.css("background-color"));
                }
            }
        }
    }
    else if (rightMouse) { // Right mouse button pressed
        tile.css("transform", "");
        tile.removeClass();
        tile.addClass("map-tile");
        tile.find("img").attr("src", tileImages['empty-tile'][1]);
        tile.addClass("empty-tile");

        // Background according to selected ground texture
        tile.css("background-color", defaultGroundColor);
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
    var tileByteArray = new Uint8Array(WIDTH*WIDTH*3);
    var i = 0;
    $(mapCtr).children().each(function() {
        tile = $(this);
        var classList = $(this).attr('class').split(/\s+/);
        $.each(classList, function(index, item) {
            if (item !== 'map-tile') {
                var id = tileImages[item][0];
                var groundId = 0;

                // Get background ID
                for (var key in groundTiles) {
                    if (groundTiles.hasOwnProperty(key) && groundTiles[key][2] === tile.css("background-color")) {
                        groundId = groundTiles[key][0];
                    }
                }

                // Also get rotation
                var angle = parseRotationAngle(tile.css("transform"));

                // Write tile ID to array
                tileByteArray[i++] = id;

                // Ground ID
                tileByteArray[i++] = groundId;

                // Angles encoded as half their value
                tileByteArray[i++] = angle/2;
            }
        });
    });

    var a = document.createElement("a");
    var file = new Blob([tileByteArray], {type: "octet/stream"});
    a.href = URL.createObjectURL(file);
    a.download = 'map.dat';
    a.click();
}

// Loads map from file
function loadMapFromFile(e) {
    var file = e.target.files[0];
    if (!file) {
        return;
    }

    var reader = new FileReader();
    reader.onload = function() {
        var mapCtr = $("#map-container");
        mapCtr.empty();

        var buffer = this.result,
	        array = new Uint8Array(buffer);

        for (var i = 0; i < array.length; i++) {
            var tileTypeIndex = array[i++];
            var tileType = "";

            var groundTypeIndex = array[i++];
            var groundColor = defaultGroundColor;

            // Loop through keys to get tile type from index
            for (var key in tileImages) {
                if (tileImages.hasOwnProperty(key) && tileImages[key][0] == tileTypeIndex) {
                    tileType = key;
                    break;
                }
            }

            // Loop through keys to get ground type from index
            for (var key in groundTiles) {
                if (groundTiles.hasOwnProperty(key) && groundTiles[key][0] == groundTypeIndex) {
                    groundColor = groundTiles[key][2];
                    break;
                }
            }

            // Angles encoded as half their value
            var angle = array[i] * 2;

            mapCtr.append("<div class=\"map-tile " + tileType + "\"><img src=\"" + tileImages[tileType][1] + "\"></div>");
            mapCtr.children().last().css("transform", "rotate(" + angle + "deg)");
            mapCtr.children().last().css("background-color", groundColor);
        }

        // Fit to container
        $(".map-tile").css("width", mapCtr.width()/WIDTH);
        $(".map-tile").css("height", mapCtr.width()/WIDTH)

        registerMapListeners();

        // Clear "choose file" dialog and unfocus it
        $("#load-btn").val(null);
        $("#load-btn").blur();
    };
    reader.readAsArrayBuffer(this.files[0]);
}

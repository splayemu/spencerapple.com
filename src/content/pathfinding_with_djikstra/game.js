document.addEventListener("DOMContentLoaded", init);

var _update_speed = 20; // ms

function calculateSpeed(speed) {
    return speed * (_update_speed / 1000.0);
}

var _paper;
var _grid;

var _grid_size;
var _grid_box;

var _visual_path;
var _spawned;

var _checkpoints = [];
var _mouse_over_color = 'red';
var _ground_color = 'green';
var _checkpoint_color = 'gray';
var _tower_color = 'black';
var _color_gradient = [
    '#0012D5',
    '#7904DC',
    '#E307BF',
    '#EB0B3B',
    '#F26C0F',
    '#F2F914',
];

var _towers = (function() {
    var my = {};

    var tower_id = 0;
    var towers = [];

    function Tower(x, y) {
        var my_tower = {};

        my_tower.id = tower_id++;
        my_tower.x = x;
        my_tower.y = y;

        return my_tower;
    }

    my.createTower = function(x, y) {
        var new_tower = new Tower(x,y);
        towers.push(new_tower);
        return new_tower.id;
    }

    my.destroyTower = function(id) {
        var index = -1;
        for(var i = 0; i < towers.length; i++) {
            if(towers[i].id == id) {
                index = i;
                break;
            }
        }

        if(index == -1) {
            return -1;
        }

        towers.splice(index, 1);
        return index;
    }

    return my;
}());

var _paths = (function() {
    var my = {};

    my.path = '';
    my.path_length = 0;

    // private methods
    function heuristicCostEstimate(index_a, index_b) {
        x_diff = (index_b / _grid_size) - (index_a / _grid_size);
        y_diff = (index_b % _grid_size) - (index_a % _grid_size);

        return Math.sqrt(Math.pow(x_diff, 2) + Math.pow(y_diff, 2));
    }

    function reconstructPath(start_index, came_from, current_node) {
        //console.log("reconstructPath: " + current_node);
        //console.log("reconstructPath: came_from[" + current_node + "]: " + came_from[current_node]);

        var x_loc = findXLoc(current_node);
        var y_loc = findYLoc(current_node);

        var current_node_str = "L" + x_loc + "," + y_loc;

        // adding a new node to the path
        if (came_from.indexOf(came_from[current_node]) != -1) {
            _grid[current_node].type = _grid[current_node].type == "empty"
                                       ? "path"
                                       : _grid[current_node].type;

            // update path heatmap
            _grid[current_node].pathed++;

            //console.log("reconstructPath: adding a new node to the path.");
            var p = reconstructPath(start_index, came_from, came_from[current_node]);

            if(_visual_path && _grid[current_node].type == "path") {
                _grid[current_node].ground.attr({ "fill": calcColorFromPathed(_grid[current_node].pathed) });
            }

            my.path_length++;
            return (p + current_node_str);
        } else {
            //console.log("reconstructPath: adding the spawn to the path.");
            return "M" + findXLoc(start_index) + "," + findYLoc(start_index);
        }
    }


    my.getPath = function () {
        return my.path;
    }

    my.getPathLength = function () {
        return my.path_length;
    }

    my.updatePath = function() {
        my.path_length = 0;
        my.path = '';
        for(var i = 1; i < _checkpoints.length; i++) {
            //console.log("Creating path between " + (i - 1) + " and " + i);
            var new_path = calculateRoutes(_checkpoints[i - 1], _checkpoints[i]);

            //console.log("Old path is: " + my.path);
            //console.log("New path is: " + new_path);
            my.path = my.path.concat(new_path);

            //console.log("updatePath: path_length:" + my.path_length);
        }
    }

    /* calculateRoutes - uses Dijkstra's algorithm to compute the path */
    function calculateRoutes(start_index, end_index){

        closedset = [];
        openset = [];
        openset.push(start_index);
        var came_from = [];

        // _grid[start_index].g_score = 0;
        _grid[start_index].f_score = heuristicCostEstimate(start_index, end_index);

        while(openset.length > 0) {
            // probably is a logic problem right here
            var current = openset[0];
            for(var i = 0; i < openset.length; i++) {
                if(_grid[openset[i]].f_score < _grid[current].f_sccore) {
                    current = i;
                }
            }
            if(current == end_index) {
                //console.log("came_from:");
                //came_from.map(function(a) {console.log("came_from[" + a + "]= " + came_from[a])});

                // finds the last parent
                var parents = came_from.filter(function(a) {return a + 1 == end_index
                                        || a - 1 == end_index
                                        || a + _grid_size == end_index
                                        || a - _grid_size == end_index});

                /*console.log("calculateRoutes: end_index: " + end_index);
                console.log("calculateRoutes: last parent: " + parents[0]);
                var tmp = end_index;
                while(tmp != start_index) {
                    console.log("calculateRoutes: path: " + tmp);
                    tmp = came_from[tmp];
                console.log("calculateRoutes: came_from[" + end_index + "]: " + came_from[end_index]);
                */
                //console.log(came_from);
                return reconstructPath(start_index, came_from, end_index);
            }

            openset.splice(openset.indexOf(current), 1);
            closedset.push(current);
            //console.log("Moved " + current + " from openset to closedset.");
            //_grid[current].ground.attr({"fill":"red"});

            // calculate neighbor nodes
            var neighbors = [];
            if(current % _grid_size + 1 < _grid_size &&
                    (_grid[current + 1].type == "empty"
                    || _grid[current + 1].type == "checkpoint"
                    || _grid[current + 1].type == "path")) {
                neighbors.push(current + 1);
            }
            if(current % _grid_size - 1 >= 0 &&
                    (_grid[current - 1].type == "empty"
                    || _grid[current - 1].type == "checkpoint"
                    || _grid[current - 1].type == "path")) {
                neighbors.push(current - 1);
            }
            if(current / _grid_size + 1 < _grid_size &&
                    (_grid[current + _grid_size].type == "empty"
                    || _grid[current + _grid_size].type == "checkpoint"
                    || _grid[current + _grid_size].type == "path")) {
                neighbors.push(current + _grid_size);
            }
            if(current / _grid_size - 1 >= 0 &&
                    (_grid[current - _grid_size].type == "empty"
                    || _grid[current - _grid_size].type == "checkpoint"
                    || _grid[current - _grid_size].type == "path")) {
                neighbors.push(current - _grid_size);
            }

            //console.log("Neighbors:");
            //neighbors.map(function(a) {console.log(a)});

            for(each_neighbor in neighbors) {
                //console.log("Looking at neighbor " + neighbors[each_neighbor]);
                var tentative_g_score = _grid[current].g_score + 1;
                var tentative_f_score
                        = tentative_g_score
                        + heuristicCostEstimate(neighbors[each_neighbor], end_index);
                if(closedset.indexOf(neighbors[each_neighbor]) != -1
                    && tentative_g_score >= _grid[current].g_score) {
                    continue;
                }

                if(openset.indexOf(neighbors[each_neighbor]) == -1
                        || tentative_g_score < _grid[current].g_score) {
                    came_from[neighbors[each_neighbor]] = current;
                    _grid[neighbors[each_neighbor]]["g_score"] = tentative_g_score;
                    _grid[neighbors[each_neighbor]]["f_score"] = tentative_f_score;

                    if(openset.indexOf(neighbors[each_neighbor]) == -1) {
                        openset.push(neighbors[each_neighbor]);
                        //_grid[neighbors[each_neighbor]].ground.attr({"fill":"blue"});
                        //console.log("Added " + neighbors[each_neighbor] + " to openset.");
                    }
                }
            }

        }
        return undefined;
    }

    return my;
}());

var _units = (function() {
    var my = {},
        path = null,
        cur_unit = null;

    function Unit(x, y, size, time) {
        var my_unit = {
            x: x,
            y: y,
            size: size
        };

        var graphics = _paper.circle(my_unit.x, my_unit.y, size)
            .attr({fill:"white"})
            .onAnimation(function () {
                var transform = graphics.attr("transform");
                my_unit.x = transform[0][1];
                my_unit.y = transform[0][2];
            });

        function remove (){
            //_spawned--;
            graphics.remove();
        }

        my_unit.remove = remove;

        graphics
            .attr({along: 0})
            .animate({along: 1}, time, remove);

        return my_unit;
    }

    // count and display time between each checkpoint
    // allow speeding up/ slowing down
    my.spawnUnit = function () {
        if (cur_unit !== null) cur_unit.remove();

        var path = _paths.getPath(),
            path_length = _paths.getPathLength(),
            x_loc = findXLoc(findSpawn()),
            y_loc = findYLoc(findSpawn()),

            p = _paper.path(_paths.getPath()).attr({ "opacity": 0 }),
            len = p.getTotalLength();

        _paper.customAttributes.along = function (v) {
            var point = p.getPointAtLength(v * len);
            return { transform: "t" + (point.x - x_loc) + "," + (point.y - y_loc) };
        };

        cur_unit = new Unit(x_loc, y_loc, _grid_box / 2, path_length * 50);
    }

    return my;
}());

function getRaphealFromDom(current_target) {
    // which DOM node was actually clicked?
    var target = current_target,

        // this DOM node has a matching Raphael object - get its ID
        rID = current_target.raphaelid,

        // now look up the raphael object in the paper
        targetR = _paper.getById(rID);

    return targetR;
}

function calcColorFromPathed (pathed) {
    return _color_gradient[pathed];
}

function mouseOnRect(e) {
    var targetR = getRaphealFromDom(e.target);
    e.stopPropagation();

    var loc = findLocFromRect(targetR);
    if (loc.type == "empty") {
        targetR.attr({ "fill": _mouse_over_color });
    } else if (loc.type == "path") {
        targetR.attr(_visual_path ? { "fill": calcColorFromPathed(loc.pathed) } :
                                    { "fill": _mouse_over_color });
    }
}

function mouseOffRect(e) {
    var targetR = getRaphealFromDom(e.target);
    e.stopPropagation();

    var loc = findLocFromRect(targetR);
    if (loc.type == "empty") {
        targetR.attr({ "fill": _ground_color });
    } else if (loc.type == "path") {
        targetR.attr(_visual_path ? { "fill": calcColorFromPathed(loc.pathed)} :
                                    { "fill": _ground_color });
    }
}

var _lastTargetR = null;
var _dragStyle = null;


function mouseDownRect(e) {
    var targetR = getRaphealFromDom(e.target);
    e.stopPropagation();

    var loc = findLocFromRect(targetR);
    if (loc.type === "tower") {
        _dragStyle = "destroy";
    } else if (loc.type === "empty" || loc.type === "path") {
        _dragStyle = "create";
    }

    toggleTower(targetR);
}


function removeTowerFromGrid(loc) {
    loc.ground.attr({ "fill": _ground_color });
    loc.type = "empty";
    _towers.destroyTower(loc.tower);
    loc.tower = undefined;
    clearGround();
    _paths.updatePath();
}

function createTowerOnGrid(loc, update) {
    loc.ground.attr({ "fill": _tower_color });
    loc.type = "tower";
    loc.tower = _towers.createTower(loc.x, loc.y);

    if (update) {
        clearGround();
        _paths.updatePath();
    }
}

function mouseDragOver(targetR) {
    if (targetR === _lastTargetR) return;
    _lastTargetR = targetR;

    // if units are out
    if(_spawned != 0) {
        return;
    }

    var loc = findLocFromRect(targetR);
    if (_dragStyle === 'destroy' && loc.type === 'tower') {
        removeTowerFromGrid(loc)
    } else if (_dragStyle === 'create' && (loc.type === 'empty' || loc.type === 'path')) {
        createTowerOnGrid(loc, loc.type === 'path' ? true : false);
    }
}

function toggleTower(targetR) {

    // if units are out
    if(_spawned != 0) {
        return;
    }

    var loc = findLocFromRect(targetR);

    if (loc.type === "tower") {
        removeTowerFromGrid(loc);
    } else if (loc.type === "empty") {
        createTowerOnGrid(loc, false);
    } else if (loc.type == "path") {
        createTowerOnGrid(loc, true);
    }
}


// types: empty, tower, checkpoint
function createLocation(x_loc, y_loc) {
    return {
        x: x_loc,
        y: y_loc,
        type: "empty",
        tower: undefined,
        pathed: -1,

        // for a*
        g_score: 0,
        f_score: 0,
    };
}

function findLocFromRect(rect) {
    for(var i = 0; i < _grid.length; i++) {
        if(_grid[i].ground == rect) {
            return _grid[i];
        }
    }
    return undefined;
}

function highlightPath() {
    _grid.map(function(loc) {
        if(loc.type == "path") {
            loc.ground.attr({ "fill": calcColorFromPathed(loc.pathed) });
        }
    });
}

function unHighlightPath() {
    _grid.map(function(loc) {
        if(loc.type == "path") {
            loc.ground.attr({ "fill": _ground_color });
        }
    });
}

function clearGround() {
    _grid.map(function(loc) {
        if(loc.type == "path") {
            loc.type = "empty";
            loc.pathed = -1;
        }
        if(loc.type == "empty") {
            loc.ground.attr({ "fill": _ground_color });
        }
        else if(loc.type == "checkpoint") {
            loc.ground.attr({ "fill": _checkpoint_color });
        }
        else if(loc.type == "tower") {
            loc.ground.attr({ "fill": _tower_color });
        }
    });
}

function findXLoc(index) {
    return Math.floor(index / _grid_size) * _grid_box + _grid_box / 2;
}

function findYLoc(index) {
    return (index % _grid_size) * _grid_box + _grid_box / 2;
}

function findSpawn() {
    return _checkpoints[0];
}

function findEnd() {
    return _checkpoints[_checkpoints.length - 1];
}

function addCheckpoint(node) {
    _checkpoints.push(node);
    _grid[node]["type"] = "checkpoint";
    _grid[node].ground.attr({ "fill": _checkpoint_color });
}

function init() {
    _visual_path = true;
    _spawned = 0;


    window.addEventListener("keypress", function(e) {
        // 97 = a
        if(e.which == 97) {
            if(_visual_path) {
                _visual_path = false;
                unHighlightPath();
            }
            else {
                _visual_path = true;
                highlightPath();
            }
        }
        // 98 = b
        if(e.which == 98) {
            if(_spawned == 0) {
                _units.spawnUnit();
            }
        }
    });

    _grid_size = 37;
    _grid_box = 20;// px

    _paper = Raphael("rcanvas", _grid_size * _grid_box, _grid_size * _grid_box);

    _grid = [];

    for(var i = 0; i < _grid_size; i++) {
        for(var j = 0; j < _grid_size; j++) {
            var x_loc = i * _grid_box,
                y_loc = j * _grid_box;

            _grid[i * _grid_size + j] = createLocation(x_loc, y_loc);
            _grid[i * _grid_size + j].ground =
                 _paper.rect(x_loc, y_loc, _grid_box, _grid_box)
                     .attr({ "fill": _ground_color });

            // mousedown and onDragOver combine for form click + drag
            _grid[i * _grid_size + j].ground
                .mouseover(mouseOnRect)
                .mouseout(mouseOffRect)
                .mousedown(mouseDownRect)
                .drag(function () { return false; })
                .onDragOver(mouseDragOver);
        }
    }

    // returns an int id based on the x and y axices
    function calcCheckpointNumber(x, y) {
        return (y - 1) + (_grid_size * (x - 1));
    }

    var checkpoint2 = calcCheckpointNumber(5, 3),
        checkpoint3 = calcCheckpointNumber(5, 19),
        checkpoint4 = calcCheckpointNumber(33, 19),
        checkpoint5 = calcCheckpointNumber(33, 5),
        checkpoint6 = calcCheckpointNumber(19, 5),
        checkpoint7 = calcCheckpointNumber(19, 33);
        checkpoint8 = calcCheckpointNumber(34, 33);

    addCheckpoint(checkpoint2);
    addCheckpoint(checkpoint3);
    addCheckpoint(checkpoint4);
    addCheckpoint(checkpoint5);
    addCheckpoint(checkpoint6);
    addCheckpoint(checkpoint7);
    addCheckpoint(checkpoint8);
    _paths.updatePath();

    // color code key
    document.getElementById('one').style.color = _color_gradient[0];
    document.getElementById('two').style.color = _color_gradient[1];
    document.getElementById('three').style.color = _color_gradient[2];
    document.getElementById('four').style.color = _color_gradient[3];
    document.getElementById('five').style.color = _color_gradient[4];
    document.getElementById('six').style.color = _color_gradient[5];
}


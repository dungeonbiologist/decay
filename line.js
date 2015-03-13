function line(x,y,x2,y2,fn){
	var length = Math.max(Math.abs(x-x2), Math.abs(y-y2));
	if(length === 0){
		fn(x,y);
		return;
	}
	var xslope = (x2-x)/length;
	var yslope = (y2-y)/length;
	for(var i=1; i<=length; i++){
		if( ! fn(Math.floor(x + xslope*i + 0.5), Math.floor(y + yslope*i + 0.5)) ){
			return;
		}
	}
}

function visable(point,context){
	if(player.wizmode){
		map[player.place.z].mobiles.forall(function (a) {
			if(! a.carried ){
				a.draw(context);
			}
		});	
		map[player.place.z].plants.forall(function (t, i, j) {
			if(t){
				t.draw(i, j, context);
			}
		});
		map[player.place.z].terrain.forall(function (t, i, j) {
			t.draw(i, j, context);
		});
		map[player.place.z].items.forall(function (t) {
			t.draw(context);
		});
		map[player.place.z].traps.forall(function (t) {
			t.draw(context);
		});
		return;
	}
	var level = map[point.z];
	var r = player.visionRadius();
	var x = point.x;
	var y = point.y;
	var z = point.z;
	var fn = function(x,y){
		var p = level.newPoint(x,y);
		var v = p.terrainAt();
		var plant = p.plantsAt();
		var things = p.mobilesAt().concat(p.itemsAt());
		for(var i=0; i<things.length; i++){
			things[i].draw(context);
		}
		if(plant){plant.draw(x,y,context);}
		v.draw(x,y,context);
		map[player.place.z].seen[x][y]= (plant)? plant.tile: v.tile; //record all terrain tiles you see
		return !v.opaque && point.distance(p) <= r;
	};
	fn(point.x,point.y);
	for(var i = -r; i <= r; i++){
		line(x,y,x+i,y-r,fn);
		line(x,y,x+i,y+r,fn);
	}
	for(var i = -r; i <=r ; i++){
		line(x,y,x-r,y+i,fn);
		line(x,y,x+r,y+i,fn);
	}
}

function astar(start,expense,success,goal, limit){
	var level = map[start.z];
	var plus = function(point,place){
		var t = {place:place, cost: point.cost + expense(place), parent:point}; 
		t.estimate = t.cost + goal.distance(place);
		return t;
	};
	var traversed = makeEmptyArray(level.width,level.height);
	var register = function(point){
		if(level.legal(point.place.x,point.place.y)){
			var t = traversed[point.place.x][point.place.y];
			if(t && point.cost >= t.cost){
				return;
			}
			traversed[point.place.x][point.place.y] = point;
			perimeter.push(point);
		}
	};
	var perimeter = [];
	register({place:start,cost:0,estimate:goal.distance(start)});
	while(perimeter.length>0){
		perimeter.sort(function(a,b){return a.estimate - b.estimate;});
		var p = perimeter.shift();
		if(p.estimate > limit){
			break;
		}
		if(success(p.place)){
			var path = [];
			for(;p; p = p.parent){
				path.unshift(p.place);
			}
			return path;
		}
		var neighbors = shuffle(p.place.neighbors());
		for(var i=0; i< neighbors.length; i++){
			register(plus(p,neighbors[i]));
		}
	}
	return [];
}
function pathfindRooms(start,goal, transitionCost, level, limit){
	var plus = function(point,place){
		var t = {place:place, cost: point.cost + transitionCost(point.place,place), parent:point}; 
		return t;
	};
	var traversed = makeEmptyArray(level.width,level.height);
	var register = function(point){
		var t = traversed[point.place.x1][point.place.y1];
		if(t && point.cost >= t.cost){
			return;
		}
		traversed[point.place.x1][point.place.y1] = point;
		perimeter.push(point);
	};
	var perimeter = [];
	register({place:start,cost:0});
	while(perimeter.length>0){
		perimeter.sort(function(a,b){return a.cost - b.cost;});
		var p = perimeter.shift();
		if(p.cost > limit){
			break;
		}
		if(p.place == goal){
			var path = [];
			for(;p; p = p.parent){
				path.unshift(p.place);
			}
			return path;
		}
		var neighbors = shuffle(p.place.neighbors);
		for(var i=0; i< neighbors.length; i++){
			register(plus(p,neighbors[i]));
		}
	}
	return [];
}
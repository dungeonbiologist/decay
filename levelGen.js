function placeStairs(level,depth,rooms,finalLevel){
	level.up = centerOfRoom(rooms[0],depth);
	level.terrain[level.up.x][level.up.y] = terrains.upstairs.init();
	if(!finalLevel){
		level.down = centerOfRoom(rooms[rooms.length-1],depth);
		level.terrain[level.down.x][level.down.y] = terrains.downstairs.init();
	}
}
function placeItems(level,depth){
/*	for(var i=0; i<2; i++){
		level.items.add(item.ammo.init(findOpenPoint(level,depth)));
	}
*/}
function findOpenPoint(level,depth){
	do{
		var point = level.newPoint( Math.floor(Math.random()*level.width), Math.floor(Math.random()*level.height));
	}while(!level.terrain[point.x][point.y].walkable);
	return point;
}
function placeTerrain(x,y,diameter,level,item, frequency){
	var min = 0 - Math.floor(diameter/2);
	var max = diameter - Math.floor(diameter/2);
	for(var i=x + min; i<x+ max; i++){
		for(var j=y + min; j<y+ max; j++){
			if(level.legal(i,j) && level.terrain[i][j].walkable && Math.random()<frequency){
				level.terrain[i][j] = item.init();
			}
		}
	}
}
 
function placeMagic(x,y,diameter,level,peak){
	var min = 0 - Math.floor(diameter/2);
	var max = diameter - Math.floor(diameter/2);
	for(var i=x + min; i<x+ max; i++){
		for(var j=y + min; j<y+ max; j++){
			if(level.legal(i,j) && level.terrain[i][j].walkable){
				var d = 1-2*Math.sqrt( (i-x)*(i-x) + (j-y)*(j-y) )/diameter;
				var m = Math.floor( Math.random()+ peak*d );
				level.magic[i][j] = Math.max( level.magic[i][j], Math.min( 4, m));
			}
		}
	}
}
 
function lineBetween(room1,room2,level){
	var p1 = centerOfRoom(room1,0);
	var p2 = centerOfRoom(room2,0);
	line(p1.x,p1.y,p2.x,p2.y,
		function(x,y){
			level.terrain[x][y] = terrains.tree.init();
			return true;
		}
	);
}
function put(x,y,doors,level,terrain){
	for(var j=0; j<doors.length; j++){
		if(within({x:x,y:y},doors[j])){
			return
		} 
	}
	level.terrain[x][y] = terrain.init();
} 
function placeRoom(room,level,terrain){
	var t = terrain || terrains.wall;
	for(var i=room.x1; i<=room.x2; i++){
		put(i,room.y1,room.doors,level,t);
		put(i,room.y2,room.doors,level,t);
	}
	for(var i=room.y1; i<=room.y2; i++){
		put(room.x1,i,room.doors,level,t);
		put(room.x2,i,room.doors,level,t);
	}
}
function loopRooms(rooms, level, loopLength){
	for(var i=0; i<rooms.length; i++){
		for(var j=0; j<rooms[i].neighbors.length; j++){
			var path = pathfindRooms(rooms[i],rooms[i].neighbors[j],
				function(room1,room2){
					return (connected(room1,room2))?1:loopLength;
				},
				level,
				loopLength+1);
			for(var k=0; k<path.length-1; k++){
				if(!connected(path[k],path[k+1])){
					connect(path[k],path[k+1],1);
				}
			}
		}
	}
}
function subdivide(room,min){
	var width = room.x2-room.x1;
	var height = room.y2-room.y1;
	var newWidth = min + Math.floor((width-min*2)*Math.random());
	var newHeight = min + Math.floor((height-min*2)*Math.random());
	if(width > height && width>=min*2){
		var roomA = {x1:room.x1, y1:room.y1, y2:room.y2, x2: room.x1 + newWidth, width:newWidth, height: room.height};
		var roomB = {x1:roomA.x2, y1:room.y1, y2:room.y2, x2:room.x2, width:room.width-newWidth+1, height: room.height};
	} else if(width <= height && height>=min*2){
		var roomA = {x1:room.x1, y1:room.y1, x2:room.x2, y2: room.y1 + newHeight, width:room.width, height: newHeight};
		var roomB = {x1:room.x1, y1:roomA.y2, y2:room.y2, x2:room.x2, width:room.width, height: room.height-newHeight+1};
	} else {
		return [room];
	}
	return subdivide(roomA,min).concat(subdivide(roomB,min));
}
function findNeighbors(rooms,contact){
	for(var i=0; i<rooms.length; i++){
		rooms[i].neighbors = [];
		rooms[i].doors = [];
	}
	for(var i=0; i<rooms.length; i++){
		for(var j=i+1; j<rooms.length; j++){
			if(neighbors(rooms[i],rooms[j]) && area(intersection(rooms[i],rooms[j])) >=contact ){
				rooms[i].neighbors.push(rooms[j]);
				rooms[j].neighbors.push(rooms[i]);
			}
		}
	}
}
function neighbors(roomA,roomB){
	if(roomA != roomB){
		if((roomA.x1 == roomB.x2 || roomA.x2 == roomB.x1) &&
			(roomA.y2 >= roomB.y1 && roomB.y2 >= roomA.y1)){
			return true;
		}
		if((roomA.y1 == roomB.y2 || roomA.y2 == roomB.y1) &&
			(roomA.x2 >= roomB.x1 && roomB.x2 >= roomA.x1)){
			return true;
		}
	}
	return false;
}
function within(point,room){
	return point.x >= room.x1 && point.x <= room.x2 && point.y >= room.y1 && point.y <= room.y2;
}
function centerOfRoom(room,depth){
	return  map[depth].newPoint(Math.floor((room.x1+room.x2)/2), Math.floor((room.y1+room.y2)/2));
}
function intersection(room1,room2){
	return {x1:Math.max(room1.x1,room2.x1), x2:Math.min(room1.x2,room2.x2), 
			y1:Math.max(room1.y1,room2.y1), y2:Math.min(room1.y2,room2.y2)};
}
function area(room){
	return Math.max(0,(1+room.x2-room.x1))*Math.max(0,(1+room.y2-room.y1));
}
function shorten(room){
	if(room.x2-room.x1 > room.y2-room.y1){
		return {x1:room.x1+1, y1:room.y1, x2:room.x2-1, y2:room.y2};
	} else {
		return {x1:room.x1, y1:room.y1+1, x2:room.x2, y2:room.y2-1};
	}
}
function randomSpace(room,min,max){
	min--;
	var width = (room.x2-room.x1+1);
	var rx = min+Math.floor(Math.random()*(Math.min(max,width)-min));
	var height = (room.y2-room.y1+1);
	var ry = min+Math.max(0,Math.floor(Math.random()*(Math.min(max,height)-min)));
	//return {width:rx,height:ry};
	return {width:1,height:2};
}
function offset(room,point,space){
	var width = (room.x2-room.x1+1);
	var minx = Math.max(0,(point.x-room.x1)-space.width+1);
	var maxx = Math.min(point.x-room.x1, width-space.width-1);
	var offsetx = Math.floor(Math.random()*(maxx-minx+1) + minx);
	var x2 = offsetx+space.width;
	
	var height = (room.y2-room.y1+1);
	var miny = Math.max(0,(point.y-room.y1)-space.height+1);
	var maxy = Math.min(point.y-room.y1, height-space.height);
	var offsety  = Math.floor(Math.random()*(maxy-miny+1) + miny);
	var y2 = offsety+space.height;
	
	return {x1:room.x1+offsetx, y1:room.y1+offsety, x2:room.x1+x2, y2:room.y1+y2};
}
function turbulate(room,min,max,level){
	var space = randomSpace(room,min,max);
	overwriteRoom(offset(room,centerOfRoom(room,level.depth),space),level,terrains.floor);
//	overwriteRoom(offset(room,centerOfRoom(room,level.depth),space),level,terrains.floor);
//	overwriteRoom(offset(room,centerOfRoom(room,level.depth),space),level,terrains.floor);
}
function overwriteRoom(room,level,terrain){
	assert(level, 'missing level');
	for(var i=room.x1; i<=room.x2; i++){
		for(var j=room.y1; j<=room.y2; j++){
			level.terrain[i][j] = terrain.init();
		}
	}
}
function fillRoom(room,level,depth,terrain,frequency){
	for(var i=room.x1; i<=room.x2; i++){
		for(var j=room.y1; j<=room.y2; j++){
			if(Math.random()<frequency && level.terrain[i][j].walkable){
				level.terrain[i][j] = terrain.init();
			}
		}
	}
}
function carveCave(room,level,depth,terrain,frequency){
	var walkable = terrain.walkable;
	var place = centerOfRoom(room, depth);
	for(var i=0; i<20; i++){
		level.terrain[place.x][place.y] = terrain.init();
		do{
			place = randomElt(place.neighbors());
		}while(! within(place,room) || (walkable && !level.terrain[place.x][place.y].walkable))
	}
}
function randomWalk(room,length,fn){
	for(var i=0; i<length; i++){
		fn(room);
		room = randomElt(room.neighbors);
	}
}
function connected(room1,room2){
	for(var j=0; j<room1.doors.length; j++){
		if(area(intersection(room1.doors[j], room2)) > 0){
			return true;
		}
	}
	return false;
}
function sameRoom(a,b){ 
	return area( intersection(a,b) ) === area(a) && area(a) === area(b);
}
function connect(room1,room2,size){
	var shared = intersection(room1,room2);
	for(;area(shared) > size+1; shared = shorten(shared)){}
	addUnique(room1.doors,shared,sameRoom);
	addUnique(room2.doors,shared,sameRoom);
	return shared;
}
function connectLevel(rooms,level){
	var connected = [];
	while(rooms.length !=0){
		var current = randomElt(rooms)
		var path = [];
		for(var i=0; i<50 && !current.accessable; i++){
			path.push(current);
			current.active = true;
			remove(rooms,current);
			
			var next = randomElt(current.neighbors);
			if(!next.active){
				connect(current,next,3);
			}
			current = next;
		}
		remove(rooms,current);
		path.push(current);
		for(var i =0; i<path.length; i++){
			path[i].accessable = true;
			path[i].active = false;
		}
	}
}
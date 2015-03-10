function thingList(){ 
	return {
		list: [],
		add: function (thing) {
			this.list.push(thing);
			this.updated = false;
		},
		remove: function (thing) {
			for (var i = 0; i < this.list.length; i++) {
				if (this.list[i] === thing) {
					this.list.splice(i, 1);
					i--;
				}
			}
			this.updated = false;
		},
		forall: function (fn) {
			for (var i = 0; i < this.list.length; i++) {
				fn(this.list[i]);
			}
		},
		at: function (point) {
			if(! this.updated){
				this.memoPositions();
			}
			assert(typeof point.x =='number','point.x undefined');
			this.updated = true;
			return (this.memo[point.x][point.y]) || [];
			//because stuff moves in the middle of a turn it is only safe to call between movments
		},
		memoPositions: function(){
			this.updated = map.turnNumber;
			var memo = makeArray(map[player.place.z].width,map[player.place.z].height, function(){return [];});
			this.forall(function(critter){ 
				assert(critter.recordLocation,'missing recordLocation function');
				critter.recordLocation(memo); 
			});
			this.memo = memo;
		}
	};
}
function makeEmptyArray(width, height) {
	var arry = [];
	for (var i = 0; i < width; i++) {
		arry[i] = [];
	}
	return arry;
}
function makeArray(width, height, initialElement) {
	var arry = [];
	for (var i = 0; i < width; i++) {
		arry[i] = [];
		for (var j = 0; j < height; j++) {
			arry[i][j] = initialElement(i, j);
		}
	}
	arry.forall = function(fn){
		for (var i = 0; i < width; i++) {
			for (var j = 0; j < height; j++) {
				fn(arry[i][j], i, j);
			}
		}
	};
	return arry;
}
function Direction(x,y){
	this.x = x;
	this.y = y;
	this.add = function(dir){
		return new Direction(this.x+dir.x, this.y + dir.y);
	};
}
function Point(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}
Point.prototype = {
	diff: function(p){
		return new Direction(p.x-this.x,p.y-this.y);
	},
	add: function(dir){
		return new Point(this.x+dir.x, this.y+dir.y, this.z, this.level);
	},
	same: function (point) {
		return (this.x == point.x) && (this.y == point.y);
	},
	distance: function(point){
		return Math.sqrt((this.x-point.x)*(this.x-point.x) + (this.y-point.y)*(this.y-point.y));
	},
	changeLevel: function(x,y,level,critter){
		if(critter.item){
			map[this.z].items.remove(critter);
			map[z].items.add(critter);
		} else if(critter.critter){
			map[this.z].mobiles.remove(critter);
			map[z].mobiles.add(critter);
		} else {
			alert('this thing is changing levels without properly changing lists');
		}
		this.move(x,y,critter);
	},
	move: function (x,y,z, critter){
		if(z>=0 && z<map.length && map[this.z].legal(x,y) ){
			if(this.z !== z){
				if(critter.item){
					map[this.z].items.remove(critter);
					map[z].items.add(critter);
				} else if(critter.critter){
					map[this.z].mobiles.remove(critter);
					map[z].mobiles.add(critter);
				} else {
					alert('this thing is changing levels without properly changing lists');
				}
			}
			if(critter.item){
				map[z].items.updated = false;
			} else if(critter.critter){
				map[z].mobiles.updated = false;
			} else {
				alert('this thing is moving and I don\'t know what list it belongs to');
			}
			this.x = x;
			this.y = y;
			this.z = z;
		}
	},
	neighbors: function(){
		var list = [];
		
		var points = [this.add(new Direction(0,-1)), this.add(new Direction(1,0)), this.add(new Direction(0,1)), this.add(new Direction(-1,0))];
		for(var i=0; i<points.length; i++){
			if(map[this.z].legal(points[i].x, points[i].y)){
				list.push(points[i]);
			}
		}
		return list;
	},
	mobilesAt: function(){
		return map[this.z].mobiles.at(this);
	},
	itemsAt: function(){
		return map[this.z].items.at(this);
	},
	trapsAt: function(){
		return map[this.z].traps.at(this);
	},
	terrainAt: function(){
		return map[this.z].terrain[this.x][this.y];
	},
	terrainSet: function(newTerrain){
		map[this.z].terrain[this.x][this.y] = newTerrain;
	}
};
function makemap(width,height) {
	var m = {
		width: width,
		height: height,
		mobiles: thingList(),
		items: thingList(),
		traps: thingList(),
		legal: function (x, y) {
			return x >= 0 && y >= 0 && x < this.width && y < this.height;
		},
		newPoint: function(x,y){
			return new Point(x,y,this.depth);
		},
		unBlocked: function (point, thing) {
			if(!(  this.legal(point.x,point.y) && (this.terrain[point.x][point.y].walkable  || (this.terrain[point.x][point.y].swimmable && thing.swimmer) || (this.terrain[point.x][point.y].flyable && thing.flier))  )){ 
				return false; 
			}
			var max = 0;
			var critters = this.mobiles.at(point);
			for(var i=0; i<critters.length; i++){
				if(critters[i] != thing){
					max = Math.max( max, critters[i].size );
				}
			}
			return max + thing.size < 4;
		},
		at: function(point){
			var a = this.mobiles.at(point);
			return a;
		},
		terrain: makeArray(width, height, function() {
			return terrains.floor.init();
		}),
		magic: makeArray(width, height, function() {
			return 0;
		}),
		seen: makeArray(width, height, function() {
			return terrainTiles.blank[0]; //set all the tiles to black to start with
		}),
		actionlist:[]
	};
	m.actionlist.tick = function(turn){
		this.sort(function(a,b){return a.turn-b.turn;});
		while(this.length>0){
			var a = this.shift();
			if(a.turn >= turn){
				this.push(a);
				break;
			}
			a.tick();
		}
	};
	m.actionlist.add = function(turn,tick){
		this.push({turn:turn, tick:tick});
	};
	return m;
}
var map;
var drawCursor =  drawTile(tile(red,black,88),21);
function initTerrain(){
	var t = Object.create(this);
	t.tile = randomElt(terrainTiles[t.tiles])
	if(!t.priority){
		t.priority = 0;
	}
	t.draw = variableDraw;
	return t;
}
function updatePlant(x,y,z){}//placeholder for magic sensitive plants
function variableDraw(x,y,context){
	if(view[hudWidth+x][y] < this.priority){
		context.drawImage(this.tile, (hudWidth + x) * tileWidth, y * tileHeight);
		view[hudWidth+x][y] = this.priority;
	}
}

function initPlant(){
	var t = Object.create(this);
	t.tile = randomElt(terrainTiles[t.tiles])
	if(!t.priority){
		t.priority = 1;
	}
	t.draw = variableDraw;
	if(!t.update){
		t.update = updatePlant; 
	}
	return t;
}

var plants;
function initPlants(){
	plants = {
	thornbush: {
		name:intern('thorn bush'),
		walkable: false,
		flyable: false,
		destructable: true,
		tiles:'thorn',
		init: initPlant
	},
	toadstool: {
		name:intern('toadstool'),
		walkable: false,
		flyable: false,
		destructable: true,
		tiles:'toadstool',
		init: initPlant
	},
	tree: {
		name:intern('a tree'),
		walkable: true,
		flyable: true,
		tiles:'tree',
		init: initPlant
	},
	mushroom: {
		name:intern('mushroom'),
		walkable: true,
		flyable: true,
		tiles:'mushroom',
		init: initPlant
	},
	herb: {
		name:intern('herb'),
		walkable: true,
		flyable: true,
		tiles:'forb',
		init: initPlant
	}, 
	grass: {
		name:intern('grass'),
		walkable: true,
		flyable: true,
		tiles:'grass',
		init: initPlant
	},
	tallGrass: {
		name:intern('tall grass'),
		walkable: true,
		flyable: true,
		tiles:'tallGrass',
		init: initPlant
	},
	deadGrass: {
		name:intern('dead grass'),
		walkable: true,
		flyable: true,
		tiles:'deadGrass',
		init: initPlant
	},
	bush: {
		name:intern('bush'),
		walkable: true,
		flyable: true,
		opaque: true,
		priority: 0,
		tiles: 'bush',
		init: initPlant
	},
	deadTree: {
		name:intern('dead tree'),
		walkable: true,
		flyable: true,
		priority: 0,
		tiles: 'cane',
		init: initPlant
	},
	jungle: {
		name:intern('thick underbrush'),
		walkable: true,
		flyable: true,
		priority: 0,
		tiles: 'jungle',
		init: initPlant
	},
	vegetation: {
		name: intern('vegetation'),
		walkable: true,
		flyable: true,
		magic:0,
		tiles: ['pebbles','veg1','veg2','veg3','veg4'],
		update:function(x,y,z){
			if(this.magic != map[z].magic[x][y]){
				this.tile = randomElt(terrainTiles[this.tiles[ map[z].magic[x][y] ]]);
				this.magic = map[z].magic[x][y];
				if(map[z].magic[x][y] <= 0){
					map[z].terrain[x][y] = terrains.drained.init();
					map[z].plants[x][y] = false;
				}
			}
		},
		init: function(){
			var t = Object.create(this);
			t.tile = randomElt(terrainTiles[t.tiles[0]])
			if(!t.priority){
				t.priority = 1;
			}
			t.draw = variableDraw;
			return t;
		}
	},
	sapling: {
		name: intern('sapling'),
		walkable: true,
		flyable: true,
		tiles: 'sapling',
		dead:false,
		die:function(){ this.dead = true; },
		init: function(x,y,z){
			var t = initPlant.call(this);
			map[z].plants[x][y]=t;
			var tick = function(){
				if(map[z].plants[x][y]===t && !t.dead){
					for(var i=x-2; i<x+3; i++){
						for(var j=y-2; j<y+3; j++){
							if(map[z].legal(i,j)){
								map[z].guarded[i][j] = true;
							}
						}
					}
					map[z].actionlist.add(map.turnNumber-0.75,tick);
				}
			}
			tick();
			return t;
		}
	},
	blightedGrowth: {
		name: intern('blighted growth'),
		walkable: true,
		flyable: true,
		tiles: 'blighted',
		update:function(x,y,z){
			if(map[z].magic[x][y] <= 0 ){
				map[z].terrain[x][y] = terrains.drained.init();
				map[z].plants[x][y] = false;
			}
		},
		init: function(x,y,z){
			var t = initPlant.call(this);
			map[z].actionlist.add(map.turnNumber+Math.floor(5*Math.random()),function(){
				map[z].plants[x][y] = t; //delayed appearence
				var a =[[x+1,y],[x-1,y],[x,y+1],[x,y-1]];
				for(var i=0; i<4; i++){
					if(map[z].legal(a[i][0],a[i][1]) && map[z].magic[a[i][0]][a[i][1]]>0 && 
					map[z].plants[a[i][0]][a[i][1]].name!=t.name && map[z].terrain[a[i][0]][a[i][1]].walkable){
						 plants.blightedGrowth.init(a[i][0],a[i][1],z);
					}
				}
				map[z].magic[x][y] = Math.min(1,map[z].magic[x][y]);
			});
			return t;
		}
	}
	};
}
var terrains;
function initTerrains(){
	terrains = {
	
	upstairs: {
		name:intern('up stairs'),
		walkable: true,
		flyable: true,
		tiles:'upstairs',
		priority:5,
		init: initTerrain
	},
	downstairs: {
		name:intern('down stairs'),
		walkable: true,
		flyable: true,
		tiles:'downstairs',
		priority:5,
		init: initTerrain
	},
	floor: {
		name:intern('bare rock floor'),
		walkable: true,
		flyable: true,
		tiles:'pebbles',
		init: initTerrain
	},
	dirt: {
		name:intern('dirt floor'),
		walkable: true,
		flyable: true,
		tiles:'dirt',
		init: initTerrain
	},
	poop: {
		name:intern('spoor'),
		walkable: true,
		flyable: true,
		tiles:'poop',
		init: initTerrain
	},
	rock: {
		name:intern('a rock'),
		walkable: true,
		flyable: true,
		tiles:'rock',
		init: initTerrain
	},
	water: {
		name:intern('deep blue pool'),
		swimmable: true,
		flyable: true,
		tiles:'water',
		init: initTerrain
	},
	muddyWater: {
		name:intern('stagnant pool'),
		swimmable: true,
		flyable: true,
		walkable: true,
		tiles:'muddyWater',
		init: initTerrain
	},
	mud: {
		name:intern('a puddle of mud'),
		flyable: true,
		walkable: true,
		tiles:'mud',
		init: initTerrain
	},
	tilefloor: {
		name:intern('a tile floor'),
		walkable: true,
		flyable: true,
		swimable: false,
		tiles:'tilefloor',
		init: initTerrain
	},
	wall: {
		name: intern('rock wall'),
		opaque: true,
		priority: 8,
		tiles: 'rockWall',
		init: initTerrain
	},
	dirtWall: {
		name: intern('dirt wall'),
		opaque: true,
		priority: 8,
		tiles: 'dirtWall',
		init: initTerrain
	},
	smoothWall: {
		name: intern('smooth wall'),
		walkable: false,
		flyable: false,
		swimable: false,
		opaque: true,
		wall: true,
		tiles: 'smoothWall',
		priority: 8,
		init: function (style){
			var t = Object.create(this);
			t.tile = terrainTiles[t.tiles][style];
			return t;
		}
	},
	drained: {
		name: intern('lifeless ground'),
		walkable: true,
		flyable: true,
		tiles: 'drained',
		init: initTerrain
	}
};
}
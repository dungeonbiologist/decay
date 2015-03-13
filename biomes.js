function initbiome(room,level,depth){
	for(var i=0; i< this.terrains.length; i+=2){
		this.pattern(room, level, depth, this.terrains[i].init(), this.terrains[i+1] );
	}
	var center = centerOfRoom(room, depth);
	if(this.inhabitants.length>0){
		randomElt(this.inhabitants).init(center.x,center.y,level);
	}
}

var biome;
function initializeBiomes(){
	biome = {
		fairyRing : {
			init:function(room,level,depth){
				var x = randomInt(room.x1+2,room.x2-2);
				var y = randomInt(room.y1+2,room.y2-2);
				placeRing(x,y, randomInt(1,2), level,function(x,y){level.plants[x][y] = plants.mushroom.init();});
				var fairy = critters.fairy.init(x,y,level);
				var wait = function(){
					if(player.place.distance({x:x,y:y})<5){
						fairy.wakeup();
					}
					else{
						level.actionlist.add(map.turnNumber, wait);
					}
				};
				level.actionlist.add(map.turnNumber, wait);
			}
		},
		gatorHole : {
			pattern: carveCave,
			terrains: [terrains.muddyWater, 1],
			inhabitants: [critters.aligator],
			init: initbiome
		},
		pardHideout: {
			pattern: fillRoom,
			terrains: [terrains.bush, 0.5],
			inhabitants: [critters.pard],
			init: initbiome
		},
		shrubland: {
			pattern: fillRoom,
			terrains: [terrains.bush, 0.5],
			inhabitants: [],
			init: initbiome
		},
		savanna: {
			pattern: fillRoom,
			terrains: [terrains.grass, 1, terrains.tallGrass, 0.5],
			inhabitants: [critters.elephant],
			init: initbiome
		},
		eyrie: {
			pattern: fillRoom,
			terrains: [terrains.rock, 0.5],
			inhabitants: [critters.gryphon],
			init: initbiome
		},
		prarie: {
			pattern: fillRoom,
			terrains: [terrains.grass, 1, terrains.deadGrass, 0.5],
			inhabitants: [critters.buffalo],
			init: initbiome
		},
		forest: {
			pattern: fillRoom,
			terrains: [terrains.herb, 0.5,terrains.tree, 0.25],
			inhabitants: [critters.bicorn],
			init: initbiome
		},
		clearing: {
			pattern: fillRoom,
			terrains: [terrains.dirt, 0.75, terrains.grass, 0.75, terrains.herb, 0.25],
			inhabitants: [],
			init: initbiome
		},
		swamp: {
			pattern: fillRoom,
			terrains: [terrains.dirt, 0.5,terrains.tallGrass, 0.75,terrains.deadTree, 0.125],
			inhabitants: [],
			init: initbiome
		},
		jungle: {
			pattern: fillRoom,
			terrains: [terrains.grass, 0.5, terrains.jungle, 0.5, terrains.bush, 0.125],
			inhabitants: [critters.snake],
			init: initbiome
		},
		mushroomPatch: {
			pattern: carveCave,
			terrains: [terrains.mushroom, 1],
			inhabitants: [],
			init: initbiome
		}
	};
}


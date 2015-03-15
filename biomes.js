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
				var size = med(1, dither(1+depth/3), 2);
				placeRing(x,y, size, level,function(x,y){level.plants[x][y] = plants.mushroom.init();});
				var fairies = [];
				if(size ==1){
					fairies.push( critters.fairy.init(x,y,level) );
				} else {
					for(var i=0; i<depth; i++){
						fairies.push( critters.fairy.init(x,y,level) );
					}
				}
				var wait = function(){
					if(player.place.distance({x:x,y:y})<6){
						for(var i=0; i<fairies.length; i++){
							fairies[i].wakeup();
						}
					}
					else{
						level.actionlist.add(map.turnNumber, wait);
					}
				};
				level.actionlist.add(map.turnNumber, wait);
			}
		},
		sacredGrove : {
			pattern: carveCave,
			terrains: [terrains.mud, 1],
			inhabitants: [critters.dryad],
			init: initbiome
		}
	};
}


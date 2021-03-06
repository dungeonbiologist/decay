function diamond(x,y,range,fn){
	var tiles = [[[x,y]],
		[[x-1,y],[x+1,y],[x,y-1],[x,y+1]],
		[[x-1,y-1],[x+1,y+1],[x+1,y-1],[x-1,y+1]],
		[[x-2,y],[x+2,y],[x,y-2],[x,y+2]]];
	for(var i=0; i<=range; i++){
		for(var j=0; j<tiles[i].length; j++){
			fn(tiles[i][j][0],tiles[i][j][1]);
		}
	}
}

function drain(x,y,z,amount,range){
	var l = map[z];
	var remainder = amount;
	var tiles = [[l.newPoint(x,y)],
		[l.newPoint(x-1,y),l.newPoint(x+1,y),l.newPoint(x,y-1),l.newPoint(x,y+1)],
		[l.newPoint(x-1,y-1),l.newPoint(x+1,y+1),l.newPoint(x+1,y-1),l.newPoint(x-1,y+1)],
		[l.newPoint(x-2,y),l.newPoint(x+2,y),l.newPoint(x,y-2),l.newPoint(x,y+2)]];
	for(var i=0; i<=range; i++){
		remainder = drainTiles(map[z], tiles[i], remainder, z);
	}
	if(player.place.same({x:x,y:y})){
		message('you drain '+(amount - remainder)+' mana', yellow);
	}
	return amount - remainder;
}

function drainTiles(level, tiles, amount){
	var z = level.depth;
	shuffle(tiles);
	var neighbors = [];
	for(var i=0; i<tiles.length;i++){
		if(tiles[i].legal()){
			neighbors.push(tiles[i]);
		}
	}
	var total = 0;
	for(var i=0; i<neighbors.length; i++){
		total+=neighbors[i].manaAt();
	}
	drainable = Math.min(amount, total);
	amount-=drainable;
	for(var i=0; drainable>0 && i<100; i++){
		neighbors.sort(function(a,b){return b.manaAt() - a.manaAt();});
		var a = neighbors[0];
		if(a.manaAt() > 0){
			drainable--;
			level.magic[a.x][a.y]--;
		}
	}
	for(var i=0; i<neighbors.length; i++){
		if(neighbors[i].plantsAt()){
			neighbors[i].plantsAt().update( neighbors[i].x, neighbors[i].y, z);
		}
	}
	return amount;
}
function enoughMana(silent){
	var mana = player.mana(this.range);
	if(!player.castFromHealth && mana<this.mana){
		if(!silent){
			message('you do not have enough  mana to cast '+interned[this.name],magenta);
		}
		return false;
	}
	return true;
}
fingerOfDeath = {
	name: intern('finger of death'),
	range: 1,
	mana: 2,
	efficiency:2,
	key:' ',
	enoughMana: enoughMana,
	target:'directional',
	activate:function(orgin,critter,point){
		message('You cast '+interned[this.name]+'.');
		var d = drain(orgin.x,orgin.y,orgin.z,16,this.range);
		if(player.castFromHealth && d<this.mana){
			player.health -= 2*(this.mana -d);
			message(interned[this.name]+' drained '+(2*(this.mana -d))+' health from you.',magenta);
			d = this.mana;
		}
		return critter.attacked(point, player, Math.floor(d/this.efficiency), false);
	},
	explain: 'Finger of death drains mana from the closest distance, and damages one target for 1 damage per 2 mana.  It is cast by attempting to move onto a tile with a creature on it.'
};
blight = {
	name: intern('blight'),
	range: 0,
	mana: 0,
	target:'none',
	key:'b',
	enoughMana: enoughMana,
	activate:function(x,y,z){
		message('You cast '+interned[this.name]+'.');
		map[z].plants[x][y]=plants.blightedGrowth.init(x,y,z);
	},
	explain: 'Blight places an infectous blight on your tile that spreads to adjacent magical squares.  It kills saplings and limits the magic in a square to one mana.'
};
fireCone = {
	name: intern('Cone of Fire'),
	range: 3,
	level: 0,
	mana: 20,
	damage:10,
	flier:true,
	climber:true, //to go through bushes
	size:3,
	key:'f',
	explain:'Cone of Fire drains 20 mana from the farthest distance, and does 10 damage to each enemy it hits',
	enoughMana: enoughMana,
	activate : function(orgin, direction){
		message('You cast '+interned[this.name]+'.');
		var d = drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		if(player.castFromHealth && d<this.mana){
			player.health -= 2*(this.mana -d);
			message(interned[this.name]+' drained '+(2*(this.mana -d))+' health from you.',magenta);
		}
		var self = this;
		var left = {x:direction.y, y:-direction.x};
		var right = {x:-direction.y, y:direction.x};
		var expand = [false,true,true,false];
		var points = [[orgin.add(direction)]];
		for(var i=0; i<expand.length; i++){
			points[i+1] = [];
			for(var j=0; j < points[i].length; j++){
				points[i+1].push( points[i][j].add(direction) );
			}
			if(expand[i]){
				points[i+1].unshift( points[i+1][0].add(left) );
				points[i+1].push( points[i+1][points[i+1].length-1].add(right) );
			}
		}
		var angle = -direction.y + direction.x + Math.abs(direction.x) +1; //0 through 3
		for(var i=0; i<points.length; i++){
			var cntn= true;
			for(var j=0; j<points[i].length; j++){
				var creatures = points[i][j].mobilesAt();
				cntn = cntn && points[i][j].unBlocked(this);
				if(points[i][j].plantsAt().destructable){
					points[i][j].setPlants(false);
				}
				if(creatures.length>0){
					(function(creatures, point){
						map[player.place.z].actionlist.add(map.turnNumber-0.5,function(){ 
							player.attack(creatures,point,false,self.damage);
						});
					})(creatures, points[i][j]); //both of these variables are changed in later iterations, so I need to close over the values
				}
			}
			if(!cntn){
				break;
			}
		}
		
		animate(orgin.x+3*direction.x-2, orgin.y+3*direction.y-2,
			mapcar(animations.coneOfFire.slice(0,i+1), function(a){return rotate(angle, a);} ) );
	}
};
teleport = {
	name: intern('teleport'),
	range: 3,
	level: 0,
	mana: 15,
	cost:1,
	flier:true,
	size:3,
	key:'t',
	explain : 'Teleport moves you in a strait line until you hit an obstacle. It drains 15 mana from the farthest distance, and uses additional mana proportional to the distance.',
	enoughMana: enoughMana,
	activate : function(orgin, target){
		var self = this;
		var next = orgin;
		var ended = next;
		line(orgin.x,orgin.y, target.x,target.y, 
		function(x,y){
			ended = next;
			next = map[player.place.z].newPoint(x,y);
			return map[player.place.z].unBlocked(next,self);
		});
		if(orgin.same(ended)){
			message('teleport failed', yellow);
			return;
		}
		message('You cast '+interned[this.name]+'.');
		var d = drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		if(player.castFromHealth && d<this.mana){
			player.health -= 2*(this.mana -d);
			message(interned[this.name]+' drained '+(2*(this.mana -d))+' health from you.',magenta);
		}
		player.dirSelected = player.place.diff(ended);
		drain(ended.x,ended.y,ended.z,orgin.distance(ended)*this.cost,this.range);
		move();
	}
};
hex = {
	name: intern('hex'),
	range: 1,
	level: 0,
	mana: 6,
	cost:1,
	damage:10,
	key:'h',
	explain : 'Hex drains 6 mana from the closest distance and places a hex on an adjacent creature of your choosing that each turn drains 1 mana to deal 1 damage to that creature, up to a maximum of 10.',
	enoughMana: enoughMana,
	activate : function(orgin, direction){
		var target = orgin.add(direction).mobilesAt();
		if(target.length == 0){
			message('There is no target there.',red);
			return false;
		}
		target = target[0];
		var self = this;
		var z = player.place.z;
		var damage = this.damage;
		var action = function(){
			var drained = drain(target.place.x,target.place.y,z,self.cost,1);
			if(target.health > 0 && damage > 0){
				if(drained >= 1){
					message('Hex drains '+drained+' mana.',yellow);
					var dealtDamage = target.attacked(target.place,player,1);
					damage--;
					message('Hex drains '+dealtDamage+' health from the '+interned[target.name]+'.',yellow);
					map[z].actionlist.add(map.turnNumber-0.1,action);
					animate(target.place.x,target.place.y,[[[randomElt(terrainTiles.sparkles)]],[[randomElt(terrainTiles.sparkles)]],[[randomElt(terrainTiles.sparkles)]]]);
				}
			} else {
				message('The hex fades away.',magenta);
			}
		};
		map[player.place.z].actionlist.add(map.turnNumber,action);
		d = drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		if(player.castFromHealth && d<this.mana){
			player.health -= 2*(this.mana -d);
			message(interned[this.name]+' drained '+(2*(this.mana -d))+' health from you.',magenta);
		}
	}
};
fortify = {
	name: intern('fortify'),
	range: 2,
	level: 0,
	mana: 10,
	key:'s',
	explain : 'Fortify drains 10 mana from the intermediate distance and places thorn bushes randomly around you.',
	enoughMana: enoughMana,
	activate: function(place){
		var d = drain(place.x,place.y,place.z,this.mana,this.range);
		if(player.castFromHealth && d<this.mana){
			player.health -= 2*(this.mana -d);
			message(interned[this.name]+' drained '+(2*(this.mana -d))+' health from you.',magenta);
		}
		maze(place.x, place.y, 2, map[place.z], function(point){ 
			if(!point.plantsAt() || !(point.plantsAt().name == plants.sapling.name)){ 
				point.setPlants(plants.thornbush.init());
				point.setMana(0);
			}
		});
	}
};
vampirism = {
	name: intern('vampirism'),
	range: 0,
	mana: 0,
	key:' ',
	enoughMana: enoughMana,
	activate:function(){},
	explain: 'Vampirism is an ability that lets you cast spells using your health instead of mana.'

};
heal = {
	name: intern('heal'),
	range: 1,
	mana: 20,
	target:'none',
	key:'r',
	enoughMana: enoughMana,
	activate:function(orgin){
		message('You cast '+interned[this.name]+'.');
		var d = drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		if(player.castFromHealth && d<this.mana){
			player.health -= 2*(this.mana -d);
			message(interned[this.name]+' drained '+(2*(this.mana -d))+' health from you.',magenta);
			d = this.mana;
		}
		var healed = Math.min(Math.floor(d/4),player.maxHealth - player.health);
		player.health += healed;
		message('You healed yourself by '+healed+' health point',green);
	},
	explain: 'Heal allows you to drain 20 mana from the closest distance and recover up to five health points.'

};
function diamond(x,y,range,fn){
	var tiles = [/*[[x,y]],*/
		[[x-1,y],[x+1,y],[x,y-1],[x,y+1]],
		[[x-1,y-1],[x+1,y+1],[x+1,y-1],[x-1,y+1]],
		[[x-2,y],[x+2,y],[x,y-2],[x,y+2]]];
	for(var i=0; i<range; i++){
		for(var j=0; j<tiles[i].length; j++){
			fn(tiles[i][j][0],tiles[i][j][1]);
		}
	}
}

function drain(x,y,z,amount,range){
	var remainder = amount;
	var tiles = [[[x,y]],
		[[x-1,y],[x+1,y],[x,y-1],[x,y+1]],
		[[x-1,y-1],[x+1,y+1],[x+1,y-1],[x-1,y+1]],
		[[x-2,y],[x+2,y],[x,y-2],[x,y+2]]];
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
		if(level.legal(tiles[i][0],tiles[i][1])){
			neighbors.push(tiles[i]);
		}
	}
	var total = 0;
	for(var i=0; i<neighbors.length; i++){
		total+=level.magic[neighbors[i][0]][neighbors[i][1]];
	}
	drainable = Math.min(amount, total);
	amount-=drainable;
	for(var i=0; drainable>0 && i<100; i++){
		neighbors.sort(function(a,b){return level.magic[b[0]][b[1]] - level.magic[a[0]][a[1]];});
		var a = neighbors[0];
		if(level.magic[a[0]][a[1]] > 0){
			drainable--;
			level.magic[a[0]][a[1]]--;
		}
	}
	for(var i=0; i<neighbors.length; i++){
		level.plants[neighbors[i][0]][neighbors[i][1]].update( neighbors[i][0], neighbors[i][1], z);
	}
	return amount;
}

fingerOfDeath = {
	name: intern('finger of death'),
	range: 1,
	level: 0,
	mana: 10,
	efficiency:1,
	target:'directional',
	activate:function(orgin,critter,point){
		var d = drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		return critter.attacked(point, player, Math.floor(d/this.efficiency), false);
	},
	description:'damages one adjacent target of your choosing for 20 damage. It uses 20 mana.'
};
blight = {
	name: intern('blight'),
	range: 0,
	level: 0,
	mana: 0,
	target:'none',
	activate:function(x,y,z){
		map[z].plants[x][y]=plants.blightedGrowth.init(x,y,z);
	},
	key:[]
};
fireCone = {
	name: intern('Cone of Fire'),
	range: 3,
	level: 0,
	mana: 10,
	damage:10,
	explain:'Cone of Fire costs 30 mana and does 10 damage to each enemy it hits',
	enoughMana: function(){
		var mana = player.mana(this.range);
		if(mana<this.mana){
			message('you do not have enough  mana to cast '+interned[this.name]);
			return false;
		}
		return true;
	},
	activate : function(orgin, direction){
		drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
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
				cntn = cntn && points[i][j].terrainAt().flyable;
				if(creatures.length>0){
					cntn  = false;
					(function(creatures, point){
						map[player.place.z].actionlist.add(map.turnNumber-1.5,function(){ 
							player.attack(creatures,point,false,self.damage);
						});
					})(creatures, points[i][j]);
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
	mana: 10,
	cost:1,
	explain : 'Teleport moves you in a strait line until you hit an obstacle. It costs 20 mana, and uses additional mana proportional to the distance.',
	enoughMana: function(){
		var mana = player.mana(this.range);
		if(mana<this.mana){
			message('you do not have enough  mana to cast '+interned[this.name]);
			return false;
		}
		return true;
	},
	activate : function(orgin, target){
		var self = this;
		var ended = orgin;
		line(orgin.x,orgin.y, target.x,target.y, 
		function(x,y){
			var creatures = map[player.place.z].newPoint(x,y).mobilesAt();
			if(creatures.length>0){
				return false;
			}
			ended = map[player.place.z].newPoint(x,y);
			return map[player.place.z].terrain[x][y].flyable;
		});
		if(orgin.same(ended)){
			message('teleport failed', yellow);
			return;
		}
		drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		player.dirSelected = player.place.diff(ended);
		move();
		drain(ended.x,ended.y,ended.z,orgin.distance(ended)*this.cost,this.range);
	}
};
hex = {
	name: intern('hex'),
	range: 1,
	level: 0,
	mana: 10,
	cost:1,
	damage:10,
	explain : '',
	enoughMana: function(){
		var mana = player.mana(this.range);
		if(mana<this.mana){
			message('you do not have enough  mana to cast '+interned[this.name]);
			return false;
		}
		return true;
	},
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
		drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
	}
};
fortify = {
	name: intern('fortify'),
	range: 1,
	level: 0,
	mana: 1,
	cost:1,
	damage:10,
	explain : '',
	enoughMana: function(){
		var mana = player.mana(this.range);
		if(mana<this.mana){
			message('you do not have enough  mana to cast '+interned[this.name]);
			return false;
		}
		return true;
	},
	activate: function(place){
		diamond(place.x,place.y,2,function(x,y){map[player.place.z].terrain[x][y]=terrains.thornbush.init();});
	}
};
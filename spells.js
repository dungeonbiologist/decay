function drain(x,y,z,amount,range){
	var remainder = amount;
	var tiles = [[[x,y]],
		[[x-1,y],[x+1,y],[x,y-1],[x,y+1]],
		[[x-1,y-1],[x+1,y+1],[x+1,y-1],[x-1,y+1]],
		[[x-2,y],[x+2,y],[x,y-2],[x,y+2]]];
	for(var i=0; i<=range; i++){
		remainder = drainTiles(map[z], tiles[i], remainder, z);
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
		level.terrain[neighbors[i][0]][neighbors[i][1]].update( neighbors[i][0], neighbors[i][1], z);
	}
	return amount;
}

fingerOfDeath = {
	name: intern('finger of death'),
	range: 1,
	level: 0,
	mana: 20,
	target:'directional',
	activate:function(x,y,z){
		
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
		map[z].terrain[x][y]=terrains.blightedGrowth.init(x,y,z);
	},
	key:[]
};
fireCone = {
	name: intern('cone of fire'),
	range: 3,
	level: 0,
	mana: 30,
	damage:10,
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
		var angle = direction.y + direction.x + Math.abs(direction.x) +1; //0 through 3
		for(var i=0; i<points.length; i++){
			var cntn= true;
			for(var j=0; j<points[i].length; j++){
				critters = points[i][j].mobilesAt();
				cntn = cntn && points[i][j].terrainAt().flyable;
				if(critters.length>0){
					cntn  = false;
					map[player.place.z].actionlist.add(map.turnNumber-1.5,function(){ 
						player.attack(critters,points[i][j],false,self.damage);
					});
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

/*
activate : function(orgin, target){
		drain(orgin.x,orgin.y,orgin.z,this.mana,this.range);
		var self = this;
		line(orgin.x,orgin.y, target.x,target.y, 
		function(x,y){
			critters = map[player.place.z].newPoint(x,y).mobilesAt();
			if(critters.length>0){
				map[player.place.z].actionlist.add(map.turnNumber-1.5,function(){ 
					player.attack(critters,map[player.place.z].newPoint(x,y),false,self.damage);
				});
				return false;
			}
			return map[player.place.z].terrain[x][y].flyable;
		}
	);
	}
*/
var animations;
var animation={running:false};
function animate(x,y,frames){
	var width = frames[0].length;
	var height = frames[0][0].length;
	var canvas = document.getElementById("canvas");
	
	var canvas2 = document.createElement('canvas');
	canvas2.width = width*tileWidth;
	canvas2.height = height*tileHeight;
	var context = canvas2.getContext('2d');
	var g = gridToMouse(x,y);
	
	context.drawImage(canvas,med(0,g.x,canvas.width-width*tileWidth),med(0,g.y,canvas.height-height*tileHeight),width*tileWidth, height*tileHeight,0,0,canvas2.width,canvas2.height);
	animation = {
		canvas : canvas2,
		frames : frames,
		frame : 0,
		running : true,
		x:x,
		y:y
	};
	setTimeout(runAnimation, 100);
}

function runAnimation(){
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext('2d');
	context.drawImage(animation.canvas, 0, 0, animation.canvas.width, animation.canvas.height, 
		(animation.x+hudWidth)*tileWidth, animation.y*tileHeight, animation.canvas.width, animation.canvas.height);
	//what we have here is the interesting situation of manually coordinating this function with its arguments
	//and then manually looping
	if(! (animation.frame < animation.frames.length) ){
		animation={running:false};
		draw();
		return;
	}
	var frame = animation.frames[animation.frame];
	for(var i=0; i<frame.length; i++){
		for(var j=0; j<frame[i].length; j++){
			if(frame[i][j] && map[player.place.z].legal(i+animation.x,j+animation.y)){
				context.drawImage(frame[i][j], (hudWidth + i + animation.x) * tileWidth, (j+animation.y) * tileHeight);
			}
		}
	}
	animation.frame++;
	setTimeout(runAnimation, 100);
}
function initAnimations(){
	var f = false;
	var i = function(){ return randomElt(terrainTiles.fire); };
	var s = function(){ return randomElt(terrainTiles.smoke); };
	animations = {
		explosion : 
			[[[false,false,false],[false,randomElt(terrainTiles.fire),false],[false,false,false]],
			[[false,randomElt(terrainTiles.fire),false],[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)],[false,randomElt(terrainTiles.fire),false]],
			[[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)],[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)],[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)]],
			[[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)],[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)],[randomElt(terrainTiles.fire),randomElt(terrainTiles.fire),randomElt(terrainTiles.fire)]]],
		coneOfFire :
			[[[f,f,f,f,f],[f,f,f,f,f],[i(),f,f,f,f],[f,f,f,f,f],[f,f,f,f,f]],
			[[f,f,f,f,f],[f,f,f,f,f],[s(),i(),f,f,f],[f,f,f,f,f],[f,f,f,f,f]],
			[[f,f,f,f,f],[f,f,f,f,f],[s(),s(),i(),f,f],[f,f,f,f,f],[f,f,f,f,f]],
			[[f,f,f,f,f],[f,f,s(),i(),f],[s(),s(),s(),i(),f],[f,f,s(),i(),f],[f,f,f,f,f]],
			[[f,f,f,i(),i()],[f,f,s(),s(),i()],[s(),s(),s(),s(),i()],[f,f,s(),s(),i()],[f,f,f,i(),i()]],
			[[f,f,f,s(),s()],[f,f,s(),s(),i()],[s(),s(),s(),s(),s()],[f,f,s(),s(),s()],[f,f,f,s(),s()]]]
	};
}
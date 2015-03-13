var display = display = {screenNumber:0,previous:0};
var messageLog = [];
function message(strng,color){
	if(!messageLog[display.screenNumber]){
		messageLog[display.screenNumber] = [];
	}
	messageLog[display.screenNumber].push({msg:strng, seen:false, color: color || white});
}
var messagebox = {
	draw: function(context){
		context.fillStyle = color[black];
		context.fillRect(this.x*tileWidth, this.y*tileHeight, this.width*tileWidth, this.height * tileHeight);
		context.fillStyle = color[white];
		if(this.lastturn !== display.screenNumber){
			this.offset = 0;
			this.lastturn = display.screenNumber;
		}
		this.fillLines();
		this.printlines(context);
	},
	turnPage: function(){
		this.offset++;
	},
	printlines: function (context){
		for(var i=0; i+this.offset*this.height < this.lines.length && i < this.height; i++){ 
			context.fillStyle = color[this.lineColor[i+this.offset*this.height]];
			context.fillText(this.lines[i+this.offset*this.height], (this.x+1)*tileWidth, (this.y+i)*tileHeight);
		}
	},
	fill: function(txt,lines){
		for(var i=0; i<txt.length; i++){
			var done = 0;
			do{
				lines.push(txt[i].msg.slice(done, done + 2.5*this.width));
				this.lineColor.push(txt[i].color);
				done += 2.5*this.width;
				if(lines.length % this.height == this.height-1){ //almost filled the availible space
				//check if this space is needed first !!!
					lines.push('-- press space for more --');
					this.lineColor.push(white);
					this.pages++;
				}
			}while(done < txt[i].msg.length);
		}
	},
	fillLines: function(){
		this.lines = [];
		this.lineColor = [];
		var filledlines=0;
		this.pages = 0;
		if(messageLog[display.screenNumber]){
			this.fill(messageLog[display.screenNumber], this.lines);
		} else if(messageLog[display.screenNumber-1]){
			this.fill(messageLog[display.screenNumber-1], this.lines);
		}
		
	},
	resize: function(x,y,height,width){
		this.x = x;
		this.y = y;
		this.height = height;
		this.width = width;
	},
	lines: [],
	pages: 0,
	lastturn: 0,
	offset: 0,
};
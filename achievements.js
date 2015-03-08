 /*
 critter that killed you
 critters killed
 how many of each
 damage taken
 damage given
 experience gained
 time used
 critters attacked but left
 killed unicorn?
 deepest level seen
 extinctionist
 clean kill //left no creatures wounded
 number of one shot kills
 */
function plural(item,singular, plural){
	if(item==1)
		return ''+item+singular;
	else
		return ''+item+plural;
}
function achievements(list){
	function pushif(thing, string){
		if(thing > 0){
			list.push(string);
		}
	}
	function foundif(thing, string){
		pushif(thing,'You found '+string);
	}
	list.push('');
	list.push('Farewell, '+player.title+'.');
	list.push('');
	if(achieve.killedBy){
		list.push('You were killed by a '+achieve.killedBy+'.');
	}
	for(var i=0; i<achieve.crittersKilled.length; i++){
		if(achieve.crittersKilled[i]){
			list.push('You killed '+ plural(achieve.crittersKilled[i],' '+ interned[i] +'.', ' '+ interned[i] +'s.'));
		}
	}
	var trophiesKept = 0;
	for(var i=0; i<player.inventory.length; i++){
		if(player.inventory[i]){ trophiesKept++; }
	}
	list.push('You got to level '+achieve.deepestLevel);
	return list;
 }
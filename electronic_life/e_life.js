//Electronic Life

var plan = ["############################",
            "#      #    #      o      ##",
            "#                          #",
            "#          #####           #",
            "##         #   #    ##     #",
            "###           ##     #     #",
            "#           ###      #     #",
            "#   ####                   #",
            "#   ##       o             #",
            "# o  #         o       ### #",
            "#    #                     #",
            "############################"];

function Vector(x, y) {
	this.x = x;
	this.y = y;
}

function Grid(width, height){
	this.space = function(width, height){
		var arr = new Array();
		for(i=0; i<height; i++){
			arr.push(new Array(width));
		}
		return arr;
	}
	this.width = width;
	this.height = height;
}
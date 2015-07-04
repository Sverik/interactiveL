var Tokens = Object.freeze({
	LEFT : 0,
	RIGHT : 1,
	X : 2,
	Y : 3,
	Z : 4
});

var Vertice = function (x, y) {
	this.x = x;
	this.y = y;
	this.lines = [];
}

Vertice.prototype.register = function(line) {
	this.lines.push(line);
}

var Line = function (v1, v2) {
	this.v1 = v1;
	this.v2 = v2;
	v1.register(this);
	v2.register(this);
}

var System = function() {
	this.angleRad = Math.PI / 2;
	this.axiom = new Array();
	this.rules = {};
}

System.prototype.setRule = function(lhs, tokens) {
	this.rules[lhs] = tokens;
}

System.prototype.iterate = function(tokens) {
	var res = new Array();
	for (var i = 0 ; i < tokens.length ; i++) {
		var rule = this.rules[tokens[i]];
		if (rule != null && rule != undefined) {
			res = res.concat(rule);
		} else {
			res.push(tokens[i]);
		}
	}
	return res;
}

System.prototype.getIteration = function(iter) {
	var tokens = new Array().concat(this.axiom);
	for (var i = 0 ; i < iter ; i++) {
		tokens = this.iterate(tokens);
	}
	return tokens;
}

System.prototype.getIterationLines = function(iter, vertices, lines) {
	var tokens = this.getIteration(iter);
	this.toLines(this.angleRad, tokens, vertices, lines);
}

System.prototype.toLines = function(rotAngleRad, tokens, vertices, lines) {
	var minX = 0;
	var maxX = 0;
	var minY = 0;
	var maxY = 0;
	var a = 0;
	var vert = new Vertice(100, 100);
	vertices.push(vert);
	for (var i = 0 ; i < tokens.length ; i++) {
		switch (tokens[i]) {
			case Tokens.LEFT:
				a += rotAngleRad;
				break;
			case Tokens.RIGHT:
				a -= rotAngleRad;
				break;
			case Tokens.X:
			case Tokens.Y:
			case Tokens.Z:
				var dx = 1;
				var dy = 0;
				var dxr = dx * Math.cos(a) - dy * Math.cos(a);
				var dyr = dx * Math.sin(a) + dy * Math.sin(a);
				var newVert = new Vertice(vert.x + dxr, vert.y + dyr);
				vertices.push(newVert);
				var line = new Line(vert, newVert);
				lines.push(line);
				vert = newVert;
				break;
		}
	}
}
/*
60
X
X = X - X ++ XX -- X + X
*/

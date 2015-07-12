var TOKENS_MAX_LEN = 50000;

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
	this.angleRad = - Math.PI / 2;
	this.axiom = new Array();
	this.rules = {};
	this.version = 1;
	this.tokensCache = new Array();
	this.linesCache = new Array();
}

System.prototype.updateVersion = function() {
	this.version++;
	this.tokensCache = new Array();
	this.linesCache = new Array();
}

System.prototype.setAxiom = function(tokens) {
	this.axiom = tokens;
	this.updateVersion();
}
	
System.prototype.setRule = function(lhs, tokens) {
	this.rules[lhs] = tokens;
	this.updateVersion();
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
		if (res.length >= TOKENS_MAX_LEN) {
			console.log("TOKENS_MAX_LEN=" + TOKENS_MAX_LEN + " reached");
			break;
		}
	}
	return res;
}

System.prototype.getIteration = function(iter) {
	if (this.tokensCache.length > iter && this.tokensCache[iter] != null) {
		return this.tokensCache[iter];
	}
	
	if (iter == 0) {
		this.tokensCache[0] = this.axiom;
		return this.axiom;
	}
	
	this.tokensCache[iter] = this.iterate(this.getIteration(iter - 1));
//	console.log("iter " + iter + " -> " + this.tokensCache[iter].length + " tokens");
	return this.tokensCache[iter];
}

System.prototype.getIterationLines = function(iter, vertices, lines) {
	var tokens = this.getIteration(iter);
	return this.toLines(this.angleRad, tokens, vertices, lines);
}

function updateBounds(bounds, vertex) {
	if (vertex.x < bounds.minX) {
		bounds.minX = vertex.x;
	}
	if (vertex.x > bounds.maxX) {
		bounds.maxX = vertex.x;
	}
	if (vertex.y < bounds.minY) {
		bounds.minY = vertex.y;
	}
	if (vertex.y > bounds.maxY) {
		bounds.maxY = vertex.y;
	}
}

System.prototype.toLines = function(rotAngleRad, tokens, vertices, lines) {
	var bounds = {
		minX : 0,
		maxX : 0,
		minY : 0,
		maxY : 0
	}
	var a = 0;
	var vert = new Vertice(0, 0);
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
				var dx = 4;
				var dy = 0;
				var dxr = dx * Math.cos(a) - dy * Math.cos(a);
				var dyr = dx * Math.sin(a) + dy * Math.sin(a);
				var newVert = new Vertice(vert.x + dxr, vert.y + dyr);
				vertices.push(newVert);
				var line = new Line(vert, newVert);
				lines.push(line);
				vert = newVert;
				updateBounds(bounds, vert);
				break;
		}
	}
	return bounds;
}

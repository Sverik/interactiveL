var TOKENS_MAX_LEN = 100000;
var PROCESS_LINES_PER_FRAME = 100;

var Bounds = function() {
	this.minX = 0;
	this.maxX = 0;
	this.minY = 0;
	this.maxY = 0;
}

Bounds.prototype.toString = function() {
	return "[x: " + this.minX + "..." + this.maxX + ", y: " + this.minY + "..." + this.maxY + "]";
}

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

Line.prototype.toString = function() {
	return "Line[" + this.v1.x + "," + this.v1.y + " -> " + this.v2.x + "," + this.v2.y + "]";
}

var System = function(statusDiv) {
	this.statusDiv = statusDiv;
	
	this.angleRad = - Math.PI / 2;
	this.axiom = new Array();
	this.rules = {};
	this.version = 1;
	this.iterVersion = new Array();
	this.tokensCache = new Array();
	this.linesCache = new Array();
	this.boundsCache = new Array();
	
	this.workBounds = new Bounds();
	this.workLines = new Array();
	this.nextLinePos = 0;
	this.workAngle = 0;
	this.workVert = new Vertice(0, 0);
}

System.prototype.frame = function() {
	var iter = 0;
	for ( ; iter < this.iterVersion.length ; iter++) {
		if (this.iterVersion[iter] == 0) {
			break;
		}
	}
	
	if (iter >= this.iterVersion.length) {
		this.statusDiv.innerHTML = "Done.";
		return;
	}
	
	this.statusDiv.innerHTML = "Iteration " + iter + ", calculated " + this.workLines.length + " lines.";
	var tokens = this.getIteration(iter);
	var done = this.toLines(this.angleRad, this.getIteration(iter));
	if (done) {
		this.boundsCache[iter] = this.workBounds;
		this.linesCache[iter] = this.workLines;
		this.iterVersion[iter] = this.version;
		this.nextLinePos = 0;
		this.workAngle = 0;
		this.workVert = new Vertice(0, 0);
		this.workLines = new Array();
		this.workBounds = new Bounds();
	}
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

System.prototype.getIterVersion = function(iter) {
	if (this.iterVersion.length > iter && this.iterVersion[iter] != undefined) {
		return this.iterVersion[iter];
	}

	return 0;
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

System.prototype.getIterationLines = function(iter) {
	if (this.linesCache.length > iter && this.linesCache[iter] != undefined && this.linesCache[iter] != null) {
		return {
			lines: this.linesCache[iter],
			bounds: this.boundsCache[iter]
		};
	} else {
		if (this.iterVersion[iter] == undefined || this.iterVersion[iter] != this.version) {
			this.iterVersion[iter] = 0;
		}
		
		var bounds = new Bounds();
		bounds.maxX = 1;
		bounds.maxY = 1;
		return {
			lines: new Array(),
			bounds: bounds
		};
	}
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

System.prototype.toLines = function(rotAngleRad, tokens) {
	for (var i = 0 ; i < PROCESS_LINES_PER_FRAME && this.nextLinePos < tokens.length ; i++) {
		switch (tokens[this.nextLinePos]) {
			case Tokens.LEFT:
				this.workAngle += rotAngleRad;
				break;
			case Tokens.RIGHT:
				this.workAngle -= rotAngleRad;
				break;
			case Tokens.X:
			case Tokens.Y:
			case Tokens.Z:
				var dx = 4;
				var dy = 0;
				var dxr = dx * Math.cos(this.workAngle) - dy * Math.cos(this.workAngle);
				var dyr = dx * Math.sin(this.workAngle) + dy * Math.sin(this.workAngle);
				var newVert = new Vertice(this.workVert.x + dxr, this.workVert.y + dyr);
				var line = new Line(this.workVert, newVert);
				this.workLines.push(line);
				this.workVert = newVert;
				updateBounds(this.workBounds, this.workVert);
				break;
		}
		this.nextLinePos++;
	}
	if (this.nextLinePos >= tokens.length) {
		// done
		return true;
	}
	// not done
	return false;
}

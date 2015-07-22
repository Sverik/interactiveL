var TOKENS_MAX_LEN = 200000;
var PROCESS_LINES_PER_FRAME = 2009;
var PROCESS_TOKENS_PER_FRAME = 5009;

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
	this.maxWantedIter = 0;
	this.tokensCache = new Array();
	this.linesVersion = new Array();
	this.linesCache = new Array();
	this.boundsCache = new Array();
	
	this.workTokens = new Array();
	this.workTokensInPos = 0;
	
	this.workBounds = new Bounds();
	this.workLines = new Array();
	this.nextLinePos = 0;
	this.workAngle = 0;
	this.workVert = new Vertice(0, 0);
}

System.prototype.frame = function() {
	var status = "";
	
	// Calculate tokens for all needed iterations.
	var tokenIter = 0;
	for ( ; tokenIter <= this.maxWantedIter ; tokenIter++ ) {
		if ( this.isEmptyArray( this.tokensCache[ tokenIter ] ) ) {
			break;
		}
	}

	if ( tokenIter <= this.maxWantedIter ) {
		var done = this.calculateTokens( tokenIter );
		status += "Iter " + tokenIter + " tokens, " + this.workTokensInPos + " calculated.";
		if ( done ) {
			this.tokensCache[ tokenIter ] = this.workTokens;
			this.workTokens = new Array();
			this.workTokensInPos = 0;
		}
	}
	
	// Calculate lines for all needed iterations.
	var iter = 0;
	for ( ; iter < this.linesVersion.length ; iter++) {
		if (this.linesVersion[iter] == 0) {
			break;
		}
	}
	
	if (iter >= this.linesVersion.length) {
		this.statusDiv.innerHTML = "Done.";
		return;
	}
	
	var tokens = this.tokensCache[ iter ];
	if ( ! this.isEmptyArray( tokens ) ) {
		var done = this.toLines(this.angleRad, tokens);
		status += " Iter " + iter + " lines, " + this.workLines.length + " calculated.";
		
		if (done) {
			this.boundsCache[iter] = this.workBounds;
			this.linesCache[iter] = this.workLines;
			this.linesVersion[iter] = this.version;
			this.nextLinePos = 0;
			this.workAngle = 0;
			this.workVert = new Vertice(0, 0);
			this.workLines = new Array();
			this.workBounds = new Bounds();
		}
	}
	
	this.statusDiv.innerHTML = status;
}

System.prototype.updateVersionLines = function() {
	this.version++;
	this.linesCache = new Array();
}

System.prototype.updateVersion = function() {
	this.updateVersionLines();
	this.maxWantedIter = 0;
	this.tokensCache = new Array();
}

System.prototype.setAxiom = function(tokens) {
	this.axiom = tokens;
	this.updateVersion();
}
	
System.prototype.setAngle = function(thetaRad) {
	this.angleRad = thetaRad;
	this.updateVersionLines();
}
	
System.prototype.setRule = function(lhs, tokens) {
	this.rules[lhs] = tokens;
	this.updateVersion();
}

System.prototype.getIterVersion = function(iter) {
	if (this.linesVersion.length > iter && this.linesVersion[iter] != undefined) {
		return this.linesVersion[iter];
	}

	return 0;
}

System.prototype.calculateTokens = function(iter) {
	if (iter == 0) {
		this.workTokens = this.axiom;
		return true;
	}
	
	var input = this.tokensCache[iter - 1];

	for (var i = 0 ; i < PROCESS_TOKENS_PER_FRAME && this.workTokensInPos < input.length ; i++) {
		var rule = this.rules[input[this.workTokensInPos]];
		if (rule != null && rule != undefined) {
			Array.prototype.push.apply(this.workTokens, rule);
		} else {
			this.workTokens.push(input[i]);
		}
		if (this.workTokens.length >= TOKENS_MAX_LEN) {
			console.log("TOKENS_MAX_LEN=" + TOKENS_MAX_LEN + " reached, iter " + iter);
			break;
		}

		this.workTokensInPos++;
	}
	
	if (this.workTokensInPos >= input.length || this.workTokens.length >= TOKENS_MAX_LEN) {
		// done
		return true;
	}
	// not done
	return false;
}

System.prototype.getIterationLines = function(iter) {
	if (this.maxWantedIter < iter) {
		this.maxWantedIter = iter;
	}
	if (this.linesCache.length > iter && this.linesCache[iter] != undefined && this.linesCache[iter] != null) {
		return {
			lines: this.linesCache[iter],
			bounds: this.boundsCache[iter]
		};
	} else {
		if (this.linesVersion[iter] == undefined || this.linesVersion[iter] != this.version) {
			this.linesVersion[iter] = 0;
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

System.prototype.isEmptyArray = function( array ) {
	return array == undefined || array == null || array.length == 0;
}
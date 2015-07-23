var tokenChars = new Array();
tokenChars[Tokens.LEFT] = '+';
tokenChars[Tokens.RIGHT] = '-';
tokenChars[Tokens.F] = 'F';
tokenChars[Tokens.G] = 'G';
tokenChars[Tokens.H] = 'H';
tokenChars[Tokens.X] = 'X';
tokenChars[Tokens.Y] = 'Y';
tokenChars[Tokens.Z] = 'Z';
tokenChars[Tokens.PUSH] = '[';
tokenChars[Tokens.POP] = ']';
console.log("input " + tokenChars);

function getTokenChar( token ) {
	return tokenChars[token];
}

var RuleInput = function(textInput, system, setExpression, getExpression) {
	this.textInput = textInput;
	var self = this;
	this.textInput.oninput = function(evt){ self.oninput(evt); };
	this.system = system;;
	this.setExpression = setExpression;
	this.getExpression = getExpression;
	this.lastVersion = 0;
}

RuleInput.prototype.oninput = function(evt) {
	var tokens = new Array();
	for (var i = 0 ; i < this.textInput.value.length ; i++) {
		if (this.textInput[i] === ' ') {
			continue;
		}
		for (var t = 0 ; t < tokenChars.length ; t++) {
			if (tokenChars[t] == this.textInput.value[i].toUpperCase()) {
				tokens.push( t );
				break;
			}
		}
	}
	this.setExpression(tokens);
}

RuleInput.prototype.frame = function() {
	if (this.lastVersion == this.system.version) {
		return;
	}
	
	if (this.textInput === document.activeElement) {
		return;
	}
	
	this.textInput.value = "";
	
	var tokens = this.getExpression();
	for (var i = 0 ; tokens != undefined && tokens != null && i < tokens.length ; i++) {
		var token = tokens[i];
		this.textInput.value += tokenChars[token] + ' ';
	}
	
	this.lastVersion = this.system.version;
}
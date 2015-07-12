console.log("rule");
var tokenChars = new Array();
tokenChars[Tokens.LEFT] = '+';
tokenChars[Tokens.RIGHT] = '-';
tokenChars[Tokens.X] = 'X';
tokenChars[Tokens.Y] = 'Y';
tokenChars[Tokens.Z] = 'Z';
console.log("input " + tokenChars);

var RuleInput = function(textInput, system) {
	this.textInput = textInput;
	var self = this;
	this.textInput.oninput = function(evt){ self.oninput(evt); };
	this.system = system;;
	this.lastVersion = 0;
}

RuleInput.prototype.oninput = function(evt) {
	var tokens = new Array();
	for (var i = 0 ; i < this.textInput.value.length ; i++) {
		if (this.textInput[i] === ' ') {
			continue;
		}
		for (var t = 0 ; t < tokenChars.length ; t++) {
//			console.log(tokenChars[t] + " vs " + this.textInput.value[i]);
			if (tokenChars[t] == this.textInput.value[i]) {
				tokens.push( t );
				break;
			}
		}
	}
	console.log("tokens: " + tokens);
	this.system.setRule(Tokens.X, tokens);
}

RuleInput.prototype.frame = function() {
	if (this.lastVersion == this.system.version) {
		return;
	}
	
	if (this.textInput === document.activeElement) {
		return;
	}
	
	this.textInput.value = "";
	
	for (var i = 0 ; i < this.system.rules[Tokens.X].length ; i++) {
		var token = this.system.rules[Tokens.X][i];
		this.textInput.value += tokenChars[token] + ' ';
	}
	
	this.lastVersion = this.system.version;
}
define("ace/mode/haggis_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function(require, exports, module) {
	"use strict";
	var oop = require("../lib/oop");
	var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
	var HaggisHighlightRules = function() {
		var comingSoon = ("RECORD|CLASS|METHODS|OVERRIDE|CONSTRUCTOR")
		var keywords = ("MOD|START|END|SET|TO|DECLARE|INITIALLY|APPEND|EXTEND|INCREMENT|INCREASE|DECREMENT|DECREASE|MULTIPLY|DIVIDE|BY|RECEIVE|INPUT|SEND|OUTPUT|IF|THEN|ELSE|WHILE|FOR|EACH|DO|SELECT|AS|INTEGER|REAL|BOOLEAN|CHARACTER|STRING|ARRAY|REPEAT|UNTIL|TIMES|FROM|PROCEDURE|FUNCTION|RETURNS|RETURN|OPEN|CLOSE|CREATE|IS'");
		var builtinConstants = ("true|false|KEYBOARD|DISPLAY");
		var builtinFunctions = ("length|LENGTH|random|RANDOM|randint|RANDINT");
		var keywordMapper = this.createKeywordMapper({
			"invalid.deprecated": comingSoon,
			"support.function": builtinFunctions,
			"variable.language": "",
			"constant.language": builtinConstants,
			"keyword": keywords
		}, "identifier");
		var decimalInteger = "(?:(?:[1-9]\\d*)|(?:0))";
		var octInteger = "(?:0[oO]?[0-7]+)";
		var hexInteger = "(?:0[xX][\\dA-Fa-f]+)";
		var binInteger = "(?:0[bB][01]+)";
		var integer = "(?:" + decimalInteger + "|" + octInteger + "|" + hexInteger + "|" + binInteger + ")";
		var exponent = "(?:[eE][+-]?\\d+)";
		var fraction = "(?:\\.\\d+)";
		var intPart = "(?:\\d+)";
		var pointFloat = "(?:(?:" + intPart + "?" + fraction + ")|(?:" + intPart + "\\.))";
		var exponentFloat = "(?:(?:" + pointFloat + "|" + intPart + ")" + exponent + ")";
		var floatNumber = "(?:" + exponentFloat + "|" + pointFloat + ")";
		var stringEscape = "\\\\(x[0-9A-Fa-f]{2}|[0-7]{3}|[\\\\abfnrtv'\"]|U[0-9A-Fa-f]{8}|u[0-9A-Fa-f]{4})";
		this.$rules = {
			"start": [{
				token: "comment",
				regex: "#.*$|//.*$"
			}, {
				token: "string", // " string
				regex: '"(?=.)',
				next: "qqstring"
			}, {
				token: "string", // ' string
				regex: "'(?=.)",
				next: "qstring"
			}, {
				token: "keyword.operator",
				regex: "\\+|\\-|\\*|\\^|\\/|&|<|>|<=|=>|==|!=|<>|="
			}, {
				token: "punctuation",
				regex: ",|\\+=|\\-=|\\*=|\\/=|="
			}, {
				token: "paren.lparen",
				regex: "[\\[\\(\\{]"
			}, {
				token: "paren.rparen",
				regex: "[\\]\\)\\}]"
			}, {
				token: ["keyword", "text", "entity.name.function"],
				regex: "(PROCEDURE|FUNCTION|CLASS)(\\s+)([\\u00BF-\\u1FFF\\u2C00-\\uD7FF\\w]+)"
			}, {
				token: "text",
				regex: "\\s+"
			}, {
				include: "constants"
			}],
			"qqstring": [{
				token: "constant.language.escape",
				regex: stringEscape
			}, {
				token: "string",
				regex: "\\\\$",
				next: "qqstring"
			}, {
				token: "string",
				regex: '"|$',
				next: "start"
			}, {
				defaultToken: "string"
			}],
			"qstring": [{
				token: "constant.language.escape",
				regex: stringEscape
			}, {
				token: "string",
				regex: "\\\\$",
				next: "qstring"
			}, {
				token: "string",
				regex: "'|$",
				next: "start"
			}, {
				defaultToken: "string"
			}],
			"constants": [{
				token: "constant.numeric", // float
				regex: floatNumber
			}, {
				token: "constant.numeric", // long integer
				regex: integer + "[lL]\\b"
			}, {
				token: "constant.numeric", // integer
				regex: integer + "\\b"
			}, {
				token: ["punctuation", "function.support"], // method
				regex: "(\\.)([a-zA-Z_]+)\\b"
			}, {
				token: keywordMapper,
				regex: "[a-zA-Z_][a-zA-Z0-9_]*\\b"
			}]
		};
		this.normalizeRules();
	};
	oop.inherits(HaggisHighlightRules, TextHighlightRules);
	exports.HaggisHighlightRules = HaggisHighlightRules;

});

define("ace/mode/folding/haggis", ["require", "exports", "module", "ace/lib/oop", "ace/mode/folding/fold_mode"], function(require, exports, module) {
	"use strict";
	var oop = require("../../lib/oop");
	var BaseFoldMode = require("./fold_mode").FoldMode;
	var FoldMode = exports.FoldMode = function(markers) {
		this.foldingStartMarker = new RegExp("([\\[{])(?:\\s*)$|(" + markers + ")(?:\\s*)(?:#.*|//.*)?$");
	};
	oop.inherits(FoldMode, BaseFoldMode);
	(function() {
		this.getFoldWidgetRange = function(session, foldStyle, row) {
			var line = session.getLine(row);
			var match = line.match(this.foldingStartMarker);
			if (match) {
				if (match[1])
					return this.openingBracketBlock(session, match[1], row, match.index);
				if (match[2])
					return this.indentationBlock(session, row, match.index + match[2].length);
				return this.indentationBlock(session, row);
			}
		};
	}).call(FoldMode.prototype);

});

define("ace/mode/haggis", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/haggis_highlight_rules", "ace/mode/folding/haggis", "ace/range"], function(require, exports, module) {
	"use strict";
	var oop = require("../lib/oop");
	var TextMode = require("./text").Mode;
	var HaggisHighlightRules = require("./haggis_highlight_rules").HaggisHighlightRules;
	var HaggisFoldMode = require("./folding/haggis").FoldMode;
	var Range = require("../range").Range;
	var Mode = function() {
		this.HighlightRules = HaggisHighlightRules;
		this.foldingRules = new HaggisFoldMode("\\:");
		this.$behaviour = this.$defaultBehaviour;
	};
	oop.inherits(Mode, TextMode);
	(function() {
		this.lineCommentStart = "#|//";
		this.$pairQuotesAfter = {
			"'": /[ruf]/i,
			'"': /[ruf]/i
		};
		this.getNextLineIndent = function(state, line, tab) {
			var indent = this.$getIndent(line);
			var tokenizedLine = this.getTokenizer().getLineTokens(line, state);
			var tokens = tokenizedLine.tokens;
			if (tokens.length && tokens[tokens.length - 1].type == "comment") {
				return indent;
			}
			if (state == "start") {
				var match = line.match(/^.*\b(START|THEN|DO|METHODS)|[\{\(\[]\s*$/);

				if (match) {
					indent += tab;
				}
			}
			return indent;
		};
		var outdents = {
			"RETURN": 1
		};
		this.checkOutdent = function(state, line, input) {
			if (input !== "\r\n" && input !== "\r" && input !== "\n")
				return false;
			var tokens = this.getTokenizer().getLineTokens(line.trim(), state).tokens;
			if (!tokens)
				return false;
			do {
				var last = tokens.pop();
			} while (last && (last.type == "comment" || (last.type == "text" && last.value.match(/^\s+$/))));
			if (!last)
				return false;
			return (last.type == "keyword" && outdents[last.value]);
		};
		this.autoOutdent = function(state, doc, row) {
			row += 1;
			var indent = this.$getIndent(doc.getLine(row));
			var tab = doc.getTabString();
			if (indent.slice(-tab.length) == tab)
				doc.remove(new Range(row, indent.length - tab.length, row, indent.length));
		};
		this.$id = "ace/mode/haggis";
		this.snippetFileId = "ace/snippets/haggis";
	}).call(Mode.prototype);
	exports.Mode = Mode;

});
(function() {
	window.require(["ace/mode/haggis"], function(m) {
		if (typeof module == "object" && typeof exports == "object" && module) {
			module.exports = m;
		}
	});
})();
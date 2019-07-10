"use strict";
window.addEventListener("load", () => {
	window.mobilecheck = function () {
		var check = false;
		(function (a) {
			if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
		})(navigator.userAgent || navigator.vendor || window.opera);
		return check;
	};
	if (mobilecheck()) {
		alert("Huomaathan, että tämä sivu ei toimi ilman fyysistä näppäimistöä.");
	}
});

function sliceString(selector) {
	if (!document.querySelector) return;
	var string = document.querySelector(selector).innerText,
		total = string.length,
		html = "";
	for (var i = 0; i < total; i++) {
		var letter = string.charAt(i);
		html += '<span class="' + "char" + (i + 1) + '">' + letter + "</span>";
	}
	document.querySelector(selector).innerHTML = html;
}
document.addEventListener("DOMContentLoaded", () => {
	document.addEventListener("keypress", event => {
		if ([8,222,160].indexOf(event.keyCode) > -1 && ["input", "textarea"].indexOf(event.target.nodeName.toLowerCase()) === -1) {
			event.preventDefault();
		}
	});
	var unfocus = false;
	var typechase = {};
	var cachedstring = "";
	var completed = 0;

	typechase.load = function (string) {
		return new Promise((resolve, reject) => {
			cachedstring = string;
			document.querySelector(".wpm").style.color = "inherit";
			document.querySelector(".wpm").style.backgroundColor = "inherit";
			document.getElementById("textbox").textContent = "";
			var correct = {
				state: true,
				length: 0
			};
			var text;
			text = {};
			text.words = {};
			var domObj = "";
			var textArr = string.split(" ");
			for (i in textArr) {
				var word = textArr[i];
				text.words[i] = {
					word: word,
					length: word.length,
					letters: []
				};
				var word = text.words[i];
				for (var i = 0; i < word.length; i++) {
					word.letters.push(word.word[i]);
				}
			}
			text.chars = [];
			for (i in text.words) {
				text.words[i].letters.forEach(function (item) {
					text.chars.push(item);
					domObj += `<char id="char${text.chars.length -
              1} class="nc">${item}</char>`;
				});
				if (i < Object.keys(text.words).length - 1) {
					text.chars.push("&nbsp;");
				}
			}
			document.getElementById("textbox").textContent = string;
			resolve({
				string: string,
				text: text,
				correct: correct
			});
		});
	};
	typechase.init = function (imports = {}) {
		document.removeEventListener("keydown", typingEventListener)
		document.removeEventListener("keydown", typingEventListener)
		document.removeEventListener("keydown", typingEventListener)
		sliceString("#textbox");
		if (!imports.string || !imports.text) throw new Error("Imports not found");
		window.correct = imports.correct;
		window.charindex = 0;
		window.text = imports.text;
		document.addEventListener("keydown", typingEventListener)
		

	};
	
		
	typechase.owntext = function () {
		document.getElementById("unfocus").style.zIndex = 2;
		document.getElementById("unfocus").style.opacity = 100;
		document.getElementById("input-text").style.zIndex = 2;
		document.getElementById("input-text").style.opacity = 100;
		document.getElementById("kumoa").addEventListener("click", () => {
			unfocus = false;
			document.getElementById("unfocus").style.zIndex = -1;
			document.getElementById("unfocus").style.opacity = 0;
			document.getElementById("input-text").style.zIndex = -1;
			document.getElementById("input-text").style.opacity = 0;
		});
		document.getElementById("ok").addEventListener("click", () => {
			let val = document.getElementById("texttoload").value;
			if (val.length > 0) {
				unfocus = false;
				typechase.load(val.toString()).then(exports => {
					typechase.init(exports);
				});
				document.getElementById("unfocus").style.zIndex = -1;
				document.getElementById("unfocus").style.opacity = 0;
				document.getElementById("input-text").style.zIndex = -1;
				document.getElementById("input-text").style.opacity = 0;
			}
		});
	};
	
	function typingEventListener(event) {
			var key = event.key;
			var keycode = event.keyCode;
			if (unfocus || event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}
			var valid = (keycode > 47 && keycode < 58) || // number keys
				keycode == 32 || keycode == 13 || // spacebar & return key(s) (if you want to allow carriage returns)
				(keycode > 64 && keycode < 91) || // letter keys
				(keycode > 95 && keycode < 112) || // numpad keys
				(keycode > 185 && keycode < 193) || // ;=,-./` (in order)
				(keycode > 218 && keycode < 223); // [\]' (in order)
			if (keycode === 32) {
				key = "&nbsp;";
			}
			if (!correct.state && key == "Backspace") {
				
				correct.state = true;
				document.querySelector(".char" + (charindex + 1)).style.color = "inherit";
				document.querySelector(".char" + (charindex + 1)).style.backgroundColor = "inherit";
			} else if (key === text.chars[charindex] && correct.state) {
				if (charindex === 1) {
					typechase.timing = Date.now();
				} else {
					typechase.wpm = (charindex - 1) / 5 / ((Date.now() - typechase.timing) * 0.0000166666);
					if (typechase.wpm < 0) typechase.wpm = 0;
				}
				charindex++;
				document.querySelector(".char" + charindex).style.color = "#25b72b";
				document.querySelector(".char" + charindex).style.backgroundColor = "#f4f4f4";
			} else if (valid) {
				correct.state = false;
				document.querySelector(".char" + (charindex + 1)).style.color = "black";
				document.querySelector(".char" + (charindex + 1)).style.backgroundColor = "#f5dddd";
			}
			if (charindex === text.chars.length) {
				document.querySelector(".wpm").style.color = "white";
				document.querySelector(".wpm").style.backgroundColor = "lightgreen";
				completed++;
			}
			if (valid && typechase.wpm) {
				document.getElementById("wpmdisplay").textContent = parseInt(typechase.wpm);
			}
			if (completed > 0) {
				document.getElementById("help").style.opacity = 0;
			}
		}

	let satun = window.texts;
	document.getElementById("satunnainen").addEventListener("click", () => {
		typechase.load(satun[Math.floor(Math.random() * satun.length)]).then(function (exports) {
			typechase.init(exports);
		});
	});
	document.getElementById("omateksti").addEventListener("click", () => {
		unfocus = true;
		typechase.owntext();
	});
	document.getElementById("uudelleen").addEventListener("click", () => {
		typechase.load(cachedstring).then(function (exports) {
			typechase.init(exports);
		});
	});
	typechase.load(satun[Math.floor(Math.random() * satun.length)]).then(exports => {
		typechase.init(exports);
	});
}, false);

function cheattyper(text, speed) {
	function kp(key) {
		speed = (60000 / speed) * 5;
		var e = new Event("keydown");
		(e.key = key), (e.keyCode = e.key.charCodeAt(0)), (e.which = e.keyCode), (e.altKey = false), (e.ctrlKey = false), (e.shiftKey = !1), (e.metaKey = false),
		window.dispatchEvent(e);
	}
	speed || (speed = 10);
	for (let i = 0; i < text.length; i++) setTimeout(function () {
		kp(text[i]);
	}, i * speed);
}
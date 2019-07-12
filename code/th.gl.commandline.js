// ======================================================================
// th.gl.commandline.js
//
// written by Timo Hoogland © 2019
// www.timohoogland.com
// info@timohoogland.com
//
// This work is licensed under a Creative Commons
// Attribution-NonCommercial-ShareAlike 4.0 International License
//======================================================================
autowatch = 1;
inlets = 1;
outlets = 1;

var POST_FLAG = 0;

var curCharacter, lineLength, isTyping;
var histLine, histAmount;

var NUM_HISTORY = 50;
var LINE_CHARS = 80;
var HIST_LINES = 12;
var CNSL_LINES = 10;
var UNIQ = Date.now();

var textMtx = new JitterMatrix("text"+UNIQ, 1, "char", LINE_CHARS, 1);
var crsrMtx = new JitterMatrix("crsr"+UNIQ, 1, "char", LINE_CHARS, 1);
var histMtx = new JitterMatrix("hist"+UNIQ, 1, "char", LINE_CHARS, NUM_HISTORY);
var dsplMtx = new JitterMatrix("disp"+UNIQ, 1, "char", LINE_CHARS, HIST_LINES);
var cnslMtx = new JitterMatrix("cnsl"+UNIQ, 1, "char", LINE_CHARS, CNSL_LINES);

function init(){
	curCharacter = 0;
	lineLength = 0;
	isTyping = false;
	histLine = 0;
	histAmount = 0;

	setFont(FONT);
	setSize(SIZE);
	setAlpha(1);
	logoEnable(0);

	showText();
}//init()

function loadbang(){
	init();
	post("th.gl.commandline initialized | www.timohoogland.com", "\n");
}//loadbang()

function keyPress(k){
	if (k >= 32 && k <= 126) { addChar(k); } //add a character

	if (k == 28 || k == 29){ gotoCharacter(k); } //move the cursor
	if (k == 30 || k == 31){ getHistory(k); } //retrieve the history
	if (k == 13){ newLine(); } //enter output code
	if (k == 127){ backSpace(); } //backspace a character

	showText();
}//keyPress()

function showText(){
	drawCursor(); //set the cursorposition
	cropHistory(); //crop the history for display
	matrixToText(); //set the matrices to the gl text objects
}//showText()

// enter the line of code, output as a message
// only if one or more characters are typed
// empty the line and store the message in the history
// move all previous history one line lower
function newLine(){
	if (lineLength > 0){
		var message = "";
		for (var i = 0; i < lineLength; i++){
			message += String.fromCharCode(textMtx.getcell(i, 0));
		}

		for (var y = NUM_HISTORY-1; y > 0; y--){
			for (var x = 0; x < LINE_CHARS; x++){
				var tempCell = histMtx.getcell(x, y-1);
				histMtx.setcell2d(x, y, tempCell);
			}
		}

		for (var x = 0; x < LINE_CHARS; x++){
			var tempCell = textMtx.getcell(x, 0);
			histMtx.setcell2d(x, 0, tempCell);
		}

		textMtx.clear();
		histAmount = constrain(histAmount+1, 0, NUM_HISTORY-1);
		histLine = 0;
		curCharacter = 0;
		lineLength = getCharCount(textMtx, 0);

		println("newLine()", "output:", message);
		outlet(0, "message", message);
	}
}//newLine()

function backSpace(k){
	// curCharacter = Math.max(0, (curCharacter-=1));
	println("backSpace()", "curChar", curCharacter);

	if (curCharacter > 0){
		curCharacter = Math.max(0, (curCharacter-=1));
		for (var i = curCharacter; i < LINE_CHARS-1; i++){
			textMtx.setcell2d(i, 0, textMtx.getcell(i+1, 0));
		}
	} else {
		// curCharacter = 0;
	}
	lineLength = getCharCount(textMtx, 0);
}//backSpace()

// add a character as text, if cursor is between characters,
// move next characters one step to the right
function addChar(k){
	println("addChar()", k);

	if (curCharacter == LINE_CHARS-1){
		return;
	}
	if (curCharacter < lineLength){
		for (var i = lineLength; i > curCharacter-1; i--){
			textMtx.setcell2d(i+1, 0, textMtx.getcell(i, 0));
		}
	}
	textMtx.setcell2d(curCharacter, 0, k);
	curCharacter += 1;
	lineLength = getCharCount(textMtx, 0);
}//addChar()

function gotoCharacter(k){
	var k = (k - 28) * 2 - 1;
	println("gotoCharacter()", k);

	if (curCharacter >= 0 && curCharacter <= lineLength){
		// add direction for current character and constrain
		curCharacter = constrain(curCharacter+k, 0, lineLength);
	}
}//gotoCharacter()

// fill all cells with spaces
// draw cursor at current character position
function drawCursor(){
	crsrMtx.setall(32);
	crsrMtx.setcell2d(curCharacter, 0, 60);
	crsrMtx.setcell2d(curCharacter+1, 0, 61);
}//drawCursor()

// return amount of characters in one line
function getCharCount(mat, line){
	var charCount = 0;
	var len = mat.dim[0];
	for (var i = 0; i < len; i++){
		if (mat.getcell(i, line) < 32){
			println("getCharCount()", charCount);
			return charCount;
		}
		charCount++;
	}
}//getCharCount()

function getHistory(k){
	var k = (k - 30) * -2 + 1;

	histLine = constrain(histLine + k, 0, histAmount);
	println("history", histLine);

	if (histLine == 0){
		textMtx.clear();
	} else {
		for (var i = 0; i < LINE_CHARS; i++){
			textMtx.setcell2d(i, 0, histMtx.getcell(i, histLine-1))
		}
	}
	lineLength = getCharCount(textMtx, 0);
	curCharacter = lineLength;
}//getHistory()

// clear the history matrix
function clearHistory(){
	histMtx.clear();
	histAmount = 0;
}//clearHistory()

function clearConsole(){
	cnslMtx.clear();
}//clearConsole()

function cropHistory(){
	dsplMtx.usesrcdim = 1;
	dsplMtx.srcdimstart = [0, 0];
	dsplMtx.srcdimend = [LINE_CHARS, HIST_LINES];
	dsplMtx.frommatrix(histMtx.name);
}//cropHistory()

// functions for displaying the console text in the jitter window
var temp = new JitterMatrix();
var cnct = new JitterObject("jit.concat");
cnct.concatdim = 1;

function console(m){
	var mat = textToMatrix(m);

	cnct.matrixcalc([mat, cnslMtx], temp);
	cnslMtx.frommatrix(temp);
	showText();
}//jit_matrix()

function textToMatrix(m){
	var mess = m.split('').map(function (c){return c.charCodeAt(0)});
	var mat = new JitterMatrix(1, "char", LINE_CHARS, 1);

	for (var i = 0; i < mess.length; i++){
		mat.setcell2d(i, 0, mess[i]);
	}
	return mat;
}//textToMatrix()

// constrain a value between a min and maximum value
function constrain(val, min, max){
	return Math.min(max, Math.max(min, val));
}//constrain()

// custom print function with debug enable/disable functionality
function println(){
	if (POST_FLAG){
		post(arrayfromargs(arguments), "\n");
	}
}//print()

// set the debug flag true/false
// non-zero is true, zero is false
function debugEnable(v){
	POST_FLAG = v != 0;

	println("//=========================");
	println("th.gl.commandline, debug enabled");
	println("");
	println("drawto", MAIN_CTX);
	println("node name", NODE_CTX);
	println("anim name", ANIM_NODE);
	println("cam name", CAM_CAP);
	println("//=========================");
}//debug()

//======================================================================
// GL TEXT OBJECTS
//======================================================================

var MAIN_CTX = "txt";
var NODE_CTX = "node" + UNIQ;
var ANIM_NODE = "anim" + UNIQ;
var CAM_CAP = "cam" + UNIQ;

// var FONT = "IBM Plex Mono SemiBold";
var FONT = "Andale mono";
var SIZE = 60;
var LOGO_TEXT = "written by timo © 2019 | www.timohoogland.com";

// the main node that all text is drawn to
// for display on videoplane through camera capture
var textNode = new JitterObject("jit.gl.node");
textNode.fsaa = 1;
textNode.type = "float32";
textNode.name = NODE_CTX;

function drawto(v){
	MAIN_CTX = v;
	textNode.drawto = MAIN_CTX;
	glVid.drawto = MAIN_CTX;
}

// the main anim node to position all text according to screensize
var animNode = new JitterObject("jit.anim.node");
animNode.name = ANIM_NODE;
animNode.position = [-2.435, 1.2, 0];

function position(x, y, z){
	animNode.position = [x, y, z];
}//position()

// the anim node and text for the command line
var textAnim = new JitterObject("jit.anim.node");
textAnim.anim = ANIM_NODE;
textAnim.scale = [0.6, 0.6, 0.6];

var glText = new JitterObject("jit.gl.text");
glText.drawto = NODE_CTX;
glText.anim = textAnim.name;
glText.gl_color = [1, 1, 1, 1];
glText.leadscale = 1.2;
glText.screenmode = 0;

// the anim node and text for the cursor
var crsrAnim = new JitterObject("jit.anim.node");
crsrAnim.anim = ANIM_NODE;
crsrAnim.scale = [0.6, 0.6, 0.6];

var glCrsr = new JitterObject("jit.gl.text");
glCrsr.drawto = NODE_CTX;
glCrsr.anim = crsrAnim.name;
glCrsr.leadscale = 1.2;
glCrsr.screenmode = 0;
glCrsr.layer = 10;

var cnt = 0;
var blinkColor = [0, 1, 1, 1];

function blink(v){
	if (v == 1){
		var glColor = blinkColor;
		glColor[3] = glCrsr.gl_color[3];
		glCrsr.gl_color = glColor;
	} else {
		glCrsr.gl_color = [1, 1, 1, glCrsr.gl_color[3]];
	}
	// glCrsr.gl_color = arrayfromargs(arguments);
}//blink()

var barAnim = new JitterObject("jit.anim.node");
barAnim.anim = ANIM_NODE;
barAnim.scale = [15, 0.12, 1];
barAnim.position = [0, -0.06, 0];
barAnim.anchor = [0, 0.12, 0];

var glTextBar = new JitterObject("jit.gl.gridshape");
glTextBar.drawto = NODE_CTX;
glTextBar.anim = barAnim.name;
glTextBar.color = [0, 0, 0, 0.5];
glTextBar.shape = "plane";

// the anim node and text for history
var histAnim = new JitterObject("jit.anim.node");
histAnim.anim = ANIM_NODE;
histAnim.scale = [0.35, 0.35, 0.35];
histAnim.position = [0, -0.25, 0];

var glHist = new JitterObject("jit.gl.text");
glHist.drawto = NODE_CTX;
glHist.anim = histAnim.name;
glHist.gl_color = [1, 1, 1, 0.8];
glHist.screenmode = 0;

function historyEnable(v){
	histAnim.enable = Math.floor(v);
	glHist.enable = Math.floor(v);
}//logoEnalbe()

// the anim node and text for console
var cnslAnim = new JitterObject("jit.anim.node");
cnslAnim.anim = ANIM_NODE;
cnslAnim.scale = [0.3, 0.3, 0.3];
cnslAnim.position = [0, -1.75, 0];

var glCnsl = new JitterObject("jit.gl.text");
glCnsl.drawto = NODE_CTX;
glCnsl.anim = cnslAnim.name;
glCnsl.gl_color = [1, 0, 0, 0.8];
glCnsl.screenmode = 0;

function consoleEnable(v){
	cnslAnim.enable = Math.floor(v);
	glCnsl.enable = Math.floor(v);
}//logoEnalbe()

// the anim node and text for logo
var logoAnim = new JitterObject("jit.anim.node");
logoAnim.anim = ANIM_NODE;
logoAnim.scale = [0.2, 0.2, 0.2];
logoAnim.position = [0, -2.7, 0];

var glLogo = new JitterObject("jit.gl.text");
glLogo.drawto = NODE_CTX;
glLogo.anim = logoAnim.name;
glLogo.gl_color = [1, 1, 1, 0.7];
glLogo.screenmode = 0;

function logoEnable(v){
	logoAnim.enable = Math.floor(v);
	glLogo.enable = Math.floor(v);
}//logoEnalbe()

// add all objects to array for easy access when
// changing multiple parameters
var allTextObj = [glText, glCrsr, glHist, glCnsl, glLogo];

function setFont(f){
	for (var i = 0; i < allTextObj.length; i++){
		allTextObj[i].font(f);
	}
}//setFont()

var alpha = 1;

function setAlpha(a){
	alpha = constrain(a, 0, 1);

	for (var i = 0; i < allTextObj.length; i++){
		allTextObj[i].blend_enable = 1;
		allTextObj[i].depth_enable = 0;

		var c = allTextObj[i].gl_color;
		c[3] = a;
		allTextObj[i].gl_color = c;
	}
}//setAlpha()

function setSize(s){
	for (var i = 0; i < allTextObj.length; i++){
		allTextObj[i].size(s);
	}
}//setFont()

function matrixToText(){
	glText.jit_matrix(textMtx.name);
	glCrsr.jit_matrix(crsrMtx.name);
	glHist.jit_matrix(dsplMtx.name);
	glCnsl.jit_matrix(cnslMtx.name);
	glLogo.text(LOGO_TEXT);
}//matrixToText()

// the camera for capture
var glCam = new JitterObject("jit.gl.camera");
glCam.drawto = NODE_CTX;
glCam.out_name = CAM_CAP;
glCam.locklook = 1;
glCam.lookat = [0, 0, 0];
glCam.capture = 1;
glCam.position = [0, 0, 4];
glCam.erase_color = [1, 1, 1, 0];
glCam.near_clip = 1;

// the videoplane for display
var glVid = new JitterObject("jit.gl.videoplane");
glVid.texture = CAM_CAP;
glVid.transform_reset = 2;
glVid.blend_enable = 1;
glVid.depth_enable = 0;
glVid.layer = 1000;

function blend(b){
	glHist.blend = b;
}//blend()

//======================================================================
// Copyright (C) 2018 Timo Hoogland
//
// This work is licensed under a Creative Commons
// Attribution-NonCommercial-ShareAlike 4.0 International License
//
// You are free to:
// Share - copy and redistribute the material in any medium or format
// Adapt - remix, transform, and build upon the material
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
//
// https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
//======================================================================

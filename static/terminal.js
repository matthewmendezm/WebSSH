var promptLength = 0;
var socket;
var editor;

// broken backslash
var specialChar = {190 : '.', 188 : ',', 191 : '/', 220 : '\\', 222 : '\''};
var shiftSpecialChar = {190 : '>', 188 : '<', 191 : '?', 220 : '|', 222 : '\"'};
var shiftNumberKeys = {48 : ')', 49 : '!', 50 : '@', 51 : '#', 52 : '$', 53 : '%', 54 : '^', 55 : '&', 56 : '*', 57 : '('};

$(document).ready(function() {

	// Initial settings for ace editor
    editor = ace.edit("terminal");
    editor.renderer.setShowGutter(false);
    editor.setShowPrintMargin(false);
    editor.getSession().setMode('ace/mode/text');

	// Focus on host input on page load
	$("#hostname").focus();

	// Move cursor to username box when enter is pressed in hostname
	$("#hostname").on('keyup', function (e) {
		if (e.keyCode == 13) {
			$("#username").focus();
		}
	});

	// Move cursor to password textbox when enter is pressed in username
	$("#username").on('keypress', function (e) {
		if (e.keyCode == 13) {
			$("#password").focus();
		}
	});
	
	$("#password").on('keyup', function (e) {
		if (e.keyCode == 13) {
			if(socket == null)
			{
				socket = io.connect();  
				socket.on('connected', function(){
					// Once the socket connects, attempt using the credentials to login with SSH credentials
					attemptLogin();
				});	
			

				// When the SSH connection is established, write the first output to the screen
				socket.on('logged in', function(output){
					editor.focus();
					editor.setValue(output, 1)
					editor.scrollToRow(100000)
					promptLength = getLastLineLengthString(output);

					// Begin listening for further commands
					$('#terminal').keyup(function(e){
						var key = convertKeyPress(e);
						sendCommand(key);
					});

					// Begin listening responses from the socket
					socket.on('sshResponse', function(response){
						response = replaceANSICodes(response);
						editor.setValue(editor.getValue() + response, 1);
						promptLength = getLastLineLengthString(response);
						editor.scrollToRow(100000)
					});
				});

				socket.on('login failed', function(){
					$("#hostname").val('');
					$("#username").val('');
					$("#password").val('');
					$("#hostname").focus();
				});
			}
			else {
				attemptLogin();
			}
		};
	});

	$('#terminal').click(function(){
		setCursorAtEndOfEditor();
	});
});

function attemptLogin()
{
	socket.emit('attemptLogin', JSON.stringify(
	{
		domain: $("#hostname").val(),
		username: $("#username").val(),
		password: $("#password").val()
	}));
}

function setCursorAtEndOfEditor()
{
	editor.focus();
	var row = editor.getLastVisibleRow();
	var column = editor.getSession().getLine(row).length;
	editor.gotoLine(row + 1, column);
}

function getLastLineLengthString(output)
{
	output = output.split('\n');
	output = output[output.length - 1];
	return output.length;
}

function getLastLineValue()
{
	var row = editor.getLastVisibleRow();
	return editor.getSession().getLine(row - 1);
}

function replaceANSICodes(string)
{
	var string = string.replace(new RegExp("\\x1b", "g"), "");
	return string.replace(new RegExp("\\[[^m]*m", "g"), "");
}

function convertKeyPress(e)
{
	var code = e.which;
	if(code >= 48 && code <= 90)
	{
		// Number key special chars
		if((code >= 48 && code <= 57) && e.shiftKey)
			return shiftNumberKeys[code];

		// 
		var char = String.fromCharCode(code);
		if(!e.shiftKey)
			char = char.toLowerCase();
	}
	else if(code >= 188)
	{
		if(e.shiftKey)
			return shiftSpecialChar[code];
		return specialChar[code];
	}
	else if(code == 13)
		return '\n';
	else if (code == 32)
		return ' ';
	else if (code == 38)
		return '\e\[A';
	else if (code == 8)
		return '\x01\x11';
	return char;
}

function sendCommand(command){
	socket.emit('sshCommand', command);
}


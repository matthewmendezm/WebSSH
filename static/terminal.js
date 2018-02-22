var promptLength = 0;
var socket;
var editor;

// broken backslash
var shiftSpecialChar = {190 : '.', 188 : ',', 191 : '/', 220 : '\\', };

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
		socket = io.connect();  
		socket.on('connected', function(){

			// Once the socket connects, attempt using the credentials to login with SSH credentials
			socket.emit('attemptLogin', JSON.stringify(
			{
				domain: $("#hostname").val(),
				username: $("#username").val(),
				password: $("#password").val()
			}));

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
					/*if(e.which == 13){
						value = getLastLineValue();
						command = value.substr(promptLength, value.length - promptLength);
						sendCommand(command);
					}
					else if (convertKeyPress(e) == 'a')
						sendCommand('\e[B');
					*/
				});

				// Begin listening responses from the socket
				socket.on('sshResponse', function(response){
					response = replaceANSICodes(response);
					editor.setValue(editor.getValue() + response, 1);
					promptLength = getLastLineLengthString(response);
					editor.scrollToRow(100000)
				});
			});
		});
	};
});

function sendCommand(command){
	socket.emit('sshCommand', command);
}

$('#terminal').click(function(){
		setCursorAtEndOfEditor();
	});
});

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
	if(code >= 65 && code <= 90)
	{
		var char = String.fromCharCode(code);
		if(!e.shiftKey)
			char = char.toLowerCase();
	}
	else if(code >= 188)
		return shiftSpecialChar[code];
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


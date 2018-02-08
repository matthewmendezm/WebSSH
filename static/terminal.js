var promptLength = 0;
var socket;
var editor;

$(document).ready(function(){

	// Initial settings for ace editor
    editor = ace.edit("terminal");
    editor.renderer.setShowGutter(false);
    editor.setShowPrintMargin(false);

	// Focus on host input on page load
	$("#hostname").focus();

	// Move cursor to username box when enter is pressed in hostname
	$("#hostname").on('keyup', function (e) {
		if (e.keyCode == 13) {
			$("#username").focus();
		}
	});

	// Move cursor to password textbox when enter is pressed in username
	$("#username").on('keyup', function (e) {
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
				editor.setValue(output, -1)
				setCursorAtEndOfEditor();
				promptLength = getLastLineLengthString(output);
				$('#terminal').keypress(function(e){
					if(e.which == 13){
						value = getLastLineValue();
						command = value.substr(promptLength, value.length - promptLength);
						sendCommand(command + '\n');
					}
				});

				// Begin listening for further commands
				socket.on('sshResponse', function(response){
					editor.setValue(editor.getValue() + response, -1);
					promptLength = getLastLineLengthString(response);
				});
			});
		});
	};
});

function sendCommand(){
	socket.emit('sshCommand', command);
}

$('#terminal').click(function(){
		setCursorAtEndOfEditor();
	});
});

function setCursorAtEndOfEditor()
{
	$("#terminal").focus();
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

function getLastLineLength()
{
	var row = editor.getLastVisibleRow();
	return editor.getSession().getLine(row).length;
}

function getLastLineValue()
{
	var row = editor.getLastVisibleRow();
	return editor.getSession().getLine(row);
}


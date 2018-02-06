var promptLength = 0;
var socket;

$(document).ready(function(){

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
				$('#terminal').val(output);
				promptLength = getLastLineLength();
				setCursorAtEndOfTextArea();
				$('#terminal').keypress(function(e){
					if(e.which == 13){
						text = $(this).val();
						text = text.split('\n');
						command = text[text.length - 1];
						command = command.substr(promptLength, command.length - promptLength);
						sendCommand(command);
					}
				});

				// Begin listening for further commands
				socket.on('sshResponse', function(response){
					$('#terminal').val($('#terminal').val() + response);
					promptLength = getLastLineLength();
				});
			});
		});
	};
});

function sendCommand(){
	socket.emit('sshCommand', command);
}

$('#terminal').click(function(){
		setCursorAtEndOfTextArea();
	});
});

function setCursorAtEndOfTextArea()
{
	$('#terminal').focus();
	$('#terminal')[0].setSelectionRange($('#terminal').val().length + 1, $('#terminal').val().length + 1)
}

function getLastLineLength()
{
	text = $('#terminal').val();
	text = text.split('\n');
	text = text[text.length - 1];
	return text.length;
}


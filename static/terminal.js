var socket;
$(document).ready(function(){
	$("#hostname").focus();
	$("#hostname").on('keyup', function (e) {
		if (e.keyCode == 13) {
			$("#username").focus();
		}
	});

	$("#username").on('keyup', function (e) {
		if (e.keyCode == 13) {
			$("#password").focus();
		}
	});

	$("#password").on('keyup', function (e) {
	if (e.keyCode == 13) {
		var hostname = $("#hostname").val();
		var username = $("#username").val();
		var password = $("#password").val();
		socket = io.connect();  
		socket.on('connected', function(){
			socket.emit('attemptLogin', JSON.stringify(
			{
				domain: hostname,
				username: username,
				password: password
			}));
		});

		socket.on('logged in', function(){
			$('#terminal').keypress(function(e){
				if(e.which == 13){
					text = $(this).val();
					text = text.split('\n');
					command = text[text.length - 1];
					sendCommand(command);
				}
			});
			socket.on('sshResponse', function(response){
				$('#terminal').val($('#terminal').val() + '\n' + response );
			});
		});
	};
});

function sendCommand(){
	socket.emit('sshCommand', command);
}

$('#terminal').click(function(){
		$('#terminal')[0].setSelectionRange($(this).val().length + 1, $(this).val().length + 1)
	});
});


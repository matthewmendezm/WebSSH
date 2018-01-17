
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
			login(hostname, username, password);
                }
        });
	
	
	$('#terminal').keypress(function(e){
		if(e.which == 13){
		}
	});

	$('#terminal').click(function(){
		$('#terminal')[0].setSelectionRange($(this).val().length + 1, $(this).val().length + 1);
	});


});

function login(domain, username, password){
	var socket = io.connect();
	socket.on('connect', function(){
		socket.emit('attemptLogin', JSON.stringify(
			{
				domain: domain,
				username: username,
				password: password
			})
		);
	});
	socket.on('ssh response', function(msg){$('#terminal').val($('#terminal').val() + '\n' + msg)});
};

var ipRequestText = "IP Address or Domain Name: ";
var usernameRequestText = "Username: ";
var passwordRequestText = "Password: ";
var IP;
var username;

$(document).ready(function(){
	var status = "needsIP";
	$('#terminal').val(ipRequestText);
	$('#terminal').keypress(function(e){
		if(e.which == 13){
			var lines = $(this).val().split("\n");
			if(status == "needsIP") {
				IP = (lines[0].substring(ipRequestText.length, lines[0].length)).trim();
				$(this).val($(this).val() + "\n" + usernameRequestText);
				status = "needsUsername";
				e.preventDefault();
			}
			else if (status == "needsUsername"){
				username = (lines[1].substring(usernameRequestText.length, lines[1].length)).trim();
	                        $(this).val($(this).val() + "\n" + passwordRequestText);
				status = "needsPassword";
				e.preventDefault();
			}
			else if (status == "needsPassword"){
				var password = (lines[2].substring(passwordRequestText.length, lines[2].length)).trim();
				e.preventDefault();
				login(IP, username, password);
				//make ajax request with ip, name, and password
			}
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
	/* $.ajax({url: "/login", 
		 data: {
			 domain : domain, 
			 username : username, 
			 password : password
		 }
	 }).done(function(data){alert(data);});*/
};

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
				var IP = (lines[0].substring(ipRequestText.length, lines[0].length)).trim();
				alert(IP);
				$(this).val($(this).val() + "\n" + usernameRequestText);
				status = "needsUsername";
				e.preventDefault();
			}
			else if (status == "needsUsername"){
				var username = (lines[1].substring(usernameRequestText.length, lines[1].length)).trim();
				alert(username);
	                        $(this).val($(this).val() + "\n" + passwordRequestText);
				status = "needsPassword";
				e.preventDefault();
			}
			else if (status == "needsPassword"){
				var password = (lines[2].substring(passwordRequestText.length, lines[2].length)).trim();
				alert(password);
				e.preventDefault();
				test();
				//make ajax request with ip, name, and password
			}
		}
	});

	$('#terminal').click(function(){
		$('#terminal')[0].setSelectionRange($(this).val().length + 1, $(this).val().length + 1);
	});
});

function test(){

};

from flask import Flask, render_template, request
from flask_socketio import SocketIO, disconnect
from paramiko import SSHClient
import json

app = Flask(__name__)
socketio = SocketIO(app)

@app.route("/")
def index():
    return render_template("shell.html"); 

@app.route("/about/")
def about():
    return render_template("about.html");

@socketio.on("attemptLogin")
def login(response):
    data = json.loads(response) 
    domain = data['domain']
    username = data['username']
    password = data['password']
    client = SSHClient();
    client.load_system_host_keys()
    client.connect(hostname = domain, username = username, password = password)
    stdin, stdout, stderr = client.exec_command('ls -l');
    socketio.emit('ssh response', stdout.read())
    client.close();
    disconnect();

@socketio.on('connect')
def test_connect():
    print "connected";

if __name__ == "__main__":
    app.run(debug=True);

from flask import Flask, render_template, request, session
from flask_socketio import SocketIO, disconnect
from flask_session import Session
from paramiko import SSHClient
import json
import eventlet

eventlet.monkey_patch()
global client

app = Flask(__name__)
app.config['SECRET_KEY'] = 'top-secret!'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
socketio = SocketIO(app, manage_session=False, async_mode='eventlet')

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
    print domain + username + password
    global client;
    client = SSHClient();
    client.load_system_host_keys()
    client.connect(hostname = domain, username = username, password = password)
    socketio.emit('logged in', 'logged in');

    #OR SEND CREDENTIALS FAILED

    #client.close()
    #disconnect()

@socketio.on('connect')
def connect():
    socketio.emit('connected', {'data': 'Connected'})
    print "connected";

@socketio.on('sshCommand')
def sendCommand(command):
    print 'sshCommand'
    global client;
    stdin, stdout, stderr = client.exec_command(command);
    socketio.emit('sshResponse', stdout.read());

if __name__ == "__main__":
    socketio.run(app);

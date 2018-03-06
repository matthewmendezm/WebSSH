from flask import Flask, render_template
from flask_socketio import SocketIO, disconnect
from ParamikoWrapper import ParamikoWrapper 
import json
import eventlet
from multiprocessing.managers import BaseManager

app = Flask(__name__)
app.debug = True

# Might want to generate random secret key.
app.config['SECRET_KEY'] = '12345'

socketio = SocketIO(app, manage_session=False, async_mode='eventlet')

@app.route("/")
def index():
    return render_template("shell.html"); 

# IMPLEMENT DISCONNECT FUNCTIONALITY

@socketio.on('connect')
def connect():
    socketio.emit('connected', {'data': 'Connected'})

@socketio.on("attemptLogin")
def login(response):
    print 'attemptLogin'
    data = json.loads(response) 
    client = get_client(data['domain'], data['username'], data['password'])
    if not client.is_connected():
        socketio.emit('login failed')
        return;
    output = client.flush_output()
    socketio.emit('logged in', output)

@socketio.on('sshCommand')
def send_command(command):
    client = get_client(None, None, None) 
    client.send_input(command);
    output = client.flush_output();
    output = output[len(command) + 1:]
    socketio.emit('sshResponse', output);

# PUT PORT IN A CONFIG FILE. Generate Auth Key
def get_client(domain, username, password):
    manager = BaseManager(address=('127.0.0.1', 31415), authkey=b'12345')
    manager.register('get_shell')
    manager.connect()
    return manager.get_shell(domain, username, password)

if __name__ == "__main__":
    socketio.run(app);


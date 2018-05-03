from flask import Flask, render_template, session
from flask_socketio import SocketIO, disconnect, join_room
from ParamikoWrapper import ParamikoWrapper 
import json
import eventlet
import uuid
from multiprocessing.managers import BaseManager

app = Flask(__name__)
app.debug = False

# Might want to generate random secret key.
app.config['SECRET_KEY'] = '12345'

socketio = SocketIO(app, manage_session=True, async_mode='eventlet')

@app.route("/")
def index():
    session['sid'] = uuid.uuid4();
    return render_template("shell.html"); 

# IMPLEMENT DISCONNECT FUNCTIONALITY

@socketio.on('connect')
def connect():
    join_room(session['sid'])
    socketio.emit('connected', {'data': 'Connected'}, room=session['sid'])


@socketio.on("attemptLogin")
def login(response):
    data = json.loads(response) 
    client = get_client(data['domain'], data['username'], data['password'], session['sid'])
    if not client.is_connected():
        socketio.emit('login failed', room=session['sid'])
        return;
    output = client.flush_output()
    socketio.emit('logged in', output, room=session['sid'])

@socketio.on('sshKeyPress')
def send_command(keyPress):
    client = get_client(None, None, None, session['sid']) 
    client.send_input(keyPress);
    output = client.flush_output();
    output = output[len(keyPress) + 1:]
    socketio.emit('sshResponse', output, room=session['sid']);

# PUT PORT IN A CONFIG FILE. Generate Auth Key
def get_client(domain, username, password, sid):
    manager = BaseManager(address=('127.0.0.1', 31415), authkey=b'12345')
    manager.register('get_shell')
    manager.connect()
    return manager.get_shell(domain, username, password, sid)

if __name__ == "__main__":
    socketio.run(app);


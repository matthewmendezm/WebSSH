from flask import Flask, render_template, request
from flask_socketio import SocketIO
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
    print domain + username + password;
    pass;

@socketio.on('connect')
def test_connect():
    print 'connected!!!!!!!!!!!1';

if __name__ == "__main__":
    app.run(debug=True);

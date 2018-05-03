from multiprocessing.managers import BaseManager
from ParamikoWrapper import ParamikoWrapper 

connection = {};
def get_shell(domain, username, password, sid):
	if sid not in connection and domain != None and username != None and password != None:
		connection[sid] = ParamikoWrapper(domain, username, password)
	return connection[sid]

#PUT PORT IN A CONFIG FILE and generate auth key
manager = BaseManager(address=('', 31415), authkey=b'12345')
manager.register('get_shell', get_shell)
manager.get_server().serve_forever()


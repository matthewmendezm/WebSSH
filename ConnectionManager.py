from multiprocessing.managers import BaseManager
from ParamikoWrapper import ParamikoWrapper 

connection = {};
# connection manager only seems to work for one single registered function at a time.
def get_shell(domain, username, password):
	if(domain != None):
		connection['connection'] = ParamikoWrapper(domain, username, password)
	return connection['connection']

#PUT PORT IN A CONFIG FILE and generate auth key
manager = BaseManager(address=('', 31415), authkey=b'12345')
manager.register('get_shell', get_connection)
manager.get_server().serve_forever()


from paramiko import SSHClient


class ParamikoWrapper:

	def __init__(self, hostname, username, password):
		self.client = SSHClient()
		self.client.load_system_host_keys()

		# Research more meaningful exceptions to catch
		try:
			self.client.connect(hostname = hostname, username = username, password = password)
			self.client.connected = True
		except:
			self.client.connected = False
			return

		try:
			self.session = self.client.invoke_shell()
			self.session.setblocking(0)
			self.session.settimeout(.25)
		except:
			self.client.connected = False
			pass

	
	def send_input(self, input):
		self.session.send(input)

	def flush_output(self):
		out = ''
		while True:
			try:
				concat = self.session.recv(10000)
				out += concat
			except:
				return out

	def is_connected(self):
		return self.client.connected;

	def __del__(self):
		self.client.close()
     
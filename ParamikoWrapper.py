from paramiko import SSHClient


class ParamikoWrapper:

	def __init__(self, hostname, username, password):
		self.client = SSHClient()
		self.client.load_system_host_keys()

		# Research more meaningful exceptions to catch
		try:
			self.client.connect(hostname = hostname, username = username, password = password)
		except:
			return None
		try:
			self.session = self.client.invoke_shell()
		except SSHException:
			return None

	
	def send_input(self, input):
		self.session.send(input)

	def flush_output(self):
		out = ''
		while True:
			concat = self.session.recv(10)
			out += concat
			if len(concat) < 10:
				return out

	def __del__(self):
		self.client.close()
     
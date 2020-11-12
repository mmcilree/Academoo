import functools
import requests
from app.federation.instance import Instance

class Manager(object):
    def __init__(self):
        # host name : <Instance Objects>
        self.instances = {
            "test": Instance("https://nnv2.host.cs.st-andrews.ac.uk/")
        }
    
    def _get_latest_timestamp(self, host, community):
        return self.instances[host].get_timestamps(community)

    def get_posts(host, community):
        pass
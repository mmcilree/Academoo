import functools
import requests
from app.federation.instance import Instance

class Manager(object):
    def __init__(self):
        # host name : <Instance Objects>
        self.instances = {}
    
    def _get_latest_timestamp(self, host, community):
        return max([x["timestamp"] for x in self.instances[host].get_timestamps(community)] + [0])

    @functools.lru_cache()
    def _get_posts(self, host, community, _timestamp): # timestamp purely for caching purposes
        return self.instances[host].get_posts(community)

    def get_posts(self, host, community):
         timestamp = self._get_latest_timestamp(host, community)
         return self._get_posts(host, community, timestamp)
    
    def get_instances(self):
        return self.instances

    def add_instance(self, host, url):
        if host in self.instances: return False

        self.instances[host] = Instance(url)
        return True
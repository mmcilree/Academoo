import os
import functools
from app.federation.instance import Instance
import time

class Manager(object):
    def __init__(self):
        # host name : <Instance Objects>
        if os.environ.get("FLASK_ENV") == "production":
            self.instances = {
                "nnv2host": Instance("https://nnv2.host.cs.st-andrews.ac.uk/"),
                "unifier": Instance("http://unifier-prod.herokuapp.com")
            }
        else:
            self.instances = {
                "cs3099-group1": Instance("https://cs3099user-a1.host.cs.st-andrews.ac.uk/"),
                "group-a10": Instance("https://cs3099user-a10.host.cs.st-andrews.ac.uk/"),
                "group-a5": Instance("https://cs3099user-a5.host.cs.st-andrews.ac.uk/"),
                "nnv2host": Instance("https://nnv2.host.cs.st-andrews.ac.uk/"),
                #"unifier": Instance("http://unifier-prod.herokuapp.com/"),
                "freddit": Instance("https://cs3099user-a7.host.cs.st-andrews.ac.uk/")
            }

    def create_post(self, host, data):
        return self.instances[host].create_post(data)
    
    def edit_post(self, host, data):
        return self.instances[host].edit_post(data)
    
    def delete_post(self, host, data):
        return self.instances[host].delete_post(data)

    def _get_latest_timestamp(self, host, community):
        timestamps = self.instances[host].get_timestamps(community)
        if timestamps is None:
            return max([x["modified"] for x in self.instances[host].get_posts(community)] + [0])

        return max([x["modified"] for x in self.instances[host].get_timestamps(community)] + [0])

    @functools.lru_cache() # timestamp purely for caching purposes
    def _get_posts(self, host, community, _timestamp):
        return self.instances[host].get_posts(community)

    def get_post_by_id(self, host, id):
        return self.instances[host].get_post_by_id(id=id)

    def get_posts(self, host, community):
        timestamp = self._get_latest_timestamp(host, community)
        return self._get_posts(host, community, timestamp)

    def get_communities(self, host, id=None):
        return self.instances[host].get_communities(id=id)
    
    def get_users(self, host, id=None):
        return self.instances[host].get_users(id=id)

    def get_instances(self):
        return list(self.instances.keys())

    def add_instance(self, host, url):
        if host in self.instances:
            return False

        self.instances[host] = Instance(url)
        return True

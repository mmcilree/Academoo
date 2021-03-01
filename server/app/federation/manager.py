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
                "nnv2host": Instance("https://nnv2.host.cs.st-andrews.ac.uk/"),
                "unifier": Instance("http://unifier-prod.herokuapp.com"),
                "freddit": Instance("https://cs3099user-a7.host.cs.st-andrews.ac.uk/")
            }

    def create_post(self, host, data, headers):
        return self.instances[host].create_post(data, headers)
    
    def edit_post(self, host, data, headers):
        return self.instances[host].edit_post(data, headers)
    
    def delete_post(self, host, data, headers):
        return self.instances[host].delete_post(data, headers)

    def _get_latest_timestamp(self, host, community, headers):
        timestamps = self.instances[host].get_timestamps(community, headers)
        if timestamps is None:
            return max([x["modified"] for x in self.instances[host].get_posts(community, headers)] + [0])

        return max([x["modified"] for x in self.instances[host].get_timestamps(community, headers)] + [0])

    #@functools.lru_cache() # timestamp purely for caching purposes      ######getting key error: unhashable type: dict
    def _get_posts(self, host, community, _timestamp, headers):
        return self.instances[host].get_posts(community, headers)

    def get_post_by_id(self, host, id, headers):
        return self.instances[host].get_post_by_id(id=id, headers=headers)

    def get_posts(self, host, community, headers):
        timestamp = self._get_latest_timestamp(host, community, headers)
        return self._get_posts(host, community, timestamp, headers)

    def get_communities(self, host, headers, id=None):
        return self.instances[host].get_communities(headers, id=id)
    
    def get_users(self, host, id=None):
        return self.instances[host].get_users(id=id)

    def get_instances(self):
        return list(self.instances.keys())

    def add_instance(self, host, url):
        if host in self.instances:
            return False

        self.instances[host] = Instance(url)
        return True

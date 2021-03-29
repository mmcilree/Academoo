import os
import functools
from app.federation.instance import Instance
from urllib.parse import urlparse
import time

class Manager(object):
    def __init__(self):
        # host name : <Instance Objects>
        if os.environ.get("FLASK_ENV") == "production":
            self.instances = {
                "freddit": Instance("https://cs3099user-a7.host.cs.st-andrews.ac.uk/"),
                "nebula": Instance("https://nebula0.herokuapp.com"),
                "fritter": Instance("https://bc89.host.cs.st-andrews.ac.uk/"),
                "feddit": Instance("http://86.176.106.252:8000/"),
                "wabberjocky": Instance("https://cs3099user-a4.host.cs.st-andrews.ac.uk/"),
                "jha10": Instance("https://cs3099user-a10.host.cs.st-andrews.ac.uk")  
            }
        else:
            self.instances = {
                "academoo": Instance("https://cs3099user-a1.host.cs.st-andrews.ac.uk/"),
                "freddit": Instance("https://cs3099user-a7.host.cs.st-andrews.ac.uk/"),
                "nebula": Instance("https://nebula0.herokuapp.com"),
                "fritter": Instance("https://bc89.host.cs.st-andrews.ac.uk/"),
                "feddit": Instance("http://86.176.106.252:8000/"),
                "wabberjocky": Instance("https://cs3099user-a4.host.cs.st-andrews.ac.uk/"),
                "jha10": Instance("https://cs3099user-a10.host.cs.st-andrews.ac.uk")  
            }

        # Two-way dictionary 
        self.url_to_instance = {}
        for inst in self.instances:
            self.url_to_instance[urlparse(self.instances[inst].url).netloc] = self.instances[inst]

    def create_post(self, host, data, headers):
        return self.instances[host].create_post(data, headers)
    
    def edit_post(self, host, data, id, headers):
        return self.instances[host].edit_post(data, id, headers)
    
    def delete_post(self, host, data, id, headers):
        return self.instances[host].delete_post(data, id, headers)

    def _get_latest_timestamp(self, host, community, headers):
        timestamps = self.instances[host].get_timestamps(community, headers)
        if timestamps is None:
            return max([x["modified"] for x in self.instances[host].get_posts(community, headers)[0]] + [0]) #Added [0] at end of call as now returns a tuple of (json list, status_code) may be good idea to check status code before iterating over list

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

        url = "http://" + url if "://" not in url else url
        self.instances[host] = Instance(url)
        self.url_to_instance[urlparse(url).netloc] = self.instances[host]
        
        return True

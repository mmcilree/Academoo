import os
import functools
from app.federation.instance import Instance
from urllib.parse import urlparse, urljoin
from utils import format_url
from frozendict import frozendict
import requests
import time

# This class is responsible for the management of external instances.
# It can add and self discover new instances. The backend Flask server communicates with
# the manager, which then redirects the requests to the correct instance to be handled.
class Manager(object):
    def __init__(self, host):
        self.host = host

        # host name : <Instance Objects>
        if os.environ.get("FLASK_ENV") == "production":
            self.instances = {
                "freddit": Instance("https://cs3099user-a7.host.cs.st-andrews.ac.uk/"),
                "nebula": Instance("https://nebula0.herokuapp.com"),
                "fritter": Instance("https://bc89.host.cs.st-andrews.ac.uk/"),
                "wabberjocky": Instance("https://cs3099user-a4.host.cs.st-andrews.ac.uk/"),
                # "jha10": Instance("https://cs3099user-a10.host.cs.st-andrews.ac.uk"),
                # "ribbit": Instance("https://cs3099user-a6.host.cs.st-andrews.ac.uk")
            }
        else:
            self.instances = {
                "academoo": Instance("https://cs3099user-a1.host.cs.st-andrews.ac.uk/"),
                "freddit": Instance("https://cs3099user-a7.host.cs.st-andrews.ac.uk/"),
                "nebula": Instance("https://nebula0.herokuapp.com"),
            }

        # URL to Instance, used for public key retrieval
        self.url_to_instance = {}
        for inst in self.instances.values():
            self.url_to_instance[urlparse(inst.url).netloc] = inst
    
    # Depth-First Search Algorithm to automatically discover new instances within the network
    def discover_instances(self):
        memo = set()
        stack = [inst.url for inst in self.instances.values()]

        while stack:
            url = stack.pop(); memo.add(url)

            try:
                ret = requests.get(urljoin(url, "/fed/discover"), timeout=3)
            except: continue
            
            if ret.status_code == 200:
                for child_url in ret.json():
                    child_url = format_url(child_url)
                    if child_url in memo: continue

                    self.add_instance(host=urlparse(child_url).netloc, url=child_url)
                    stack.append(child_url)
                                
    def create_post(self, host, data, headers):
        return self.instances[host].create_post(data, headers)
    
    def edit_post(self, host, data, id, headers):
        return self.instances[host].edit_post(data, id, headers)
    
    def delete_post(self, host, data, id, headers):
        return self.instances[host].delete_post(data, id, headers)

    # Returns the latest modification timestamp of a community.
    # Used to determine whether cache needs updating
    def _get_latest_timestamp(self, host, community, headers):
        timestamps = self.instances[host].get_timestamps(community, headers)

        if timestamps == []: return 0
        if timestamps is None:
            return max([x["modified"] for x in self.instances[host].get_posts(community, headers)[0]] + [0]) #Added [0] at end of call as now returns a tuple of (json list, status_code) may be good idea to check status code before iterating over list

        return max([x["modified"] for x in self.instances[host].get_timestamps(community, headers)] + [0])

    @functools.lru_cache() # timestamp purely for caching purposes
    def _get_posts(self, host, community, _timestamp, headers):
        return self.instances[host].get_posts(community, dict(headers))

    def get_post_by_id(self, host, id, headers):
        return self.instances[host].get_post_by_id(id=id, headers=headers)

    def get_posts(self, host, community, headers):
        timestamp = self._get_latest_timestamp(host, community, headers.copy())
        return self._get_posts(host, community, timestamp, frozendict(headers))

    def get_communities(self, host, headers, id=None):
        return self.instances[host].get_communities(headers, id=id)
    
    def get_users(self, host, id=None):
        return self.instances[host].get_users(id=id)

    def get_instances(self):
        return [key for key in self.instances if not self.instances[key].disabled]

    def add_instance(self, host, url):
        netloc = urlparse(url).netloc
        if host in self.instances or netloc in self.url_to_instance or netloc == self.host:
            return False

        url = format_url(url)
        self.instances[host] = Instance(url)
        self.url_to_instance[netloc] = self.instances[host]
        
        return True

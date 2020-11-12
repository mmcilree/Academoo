import requests
from urllib.parse import urljoin

class Instance(object):
    def __init__(self, url):
        self.url = url
    

    def get_timestamps(self, community):
        ret = requests.get(urljoin(self.url, f"/fed/communities/{community}/timestamps"))
        print(ret.text)
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts():
        pass
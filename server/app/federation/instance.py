import requests
from urllib.parse import urljoin

class Instance(object):
    def __init__(self, url):
        self.url = url
    
    def get_timestamps(self, community):
        ret = requests.get(urljoin(self.url, f"/api/communities/{community}/timestamps"))
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts(self, community):
        ret = requests.get(urljoin(self.url, f"/api/posts?community={community}"))
        return ret.json()

    def get_post_by_id(self, id):
        ret = requests.get(urljoin(self.url, f"/api/posts/{id}")) 
        return ret.json()

    def get_communities(self, id=None):
        if id:
            ret = requests.get(urljoin(self.url, f"/api/communities/{id}"))
        else:
            ret = requests.get(urljoin(self.url, "/api/communities"))

        return ret.json()

    def create_post(self, data):
        print(requests.post(urljoin(self.url, f"/api/posts"), json=data))
    
    # TODO: editing and deleting posts
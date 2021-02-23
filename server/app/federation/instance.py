import requests
from urllib.parse import urljoin
from flask import jsonify, request, Response

class Instance(object):
    def __init__(self, url):
        self.url = url
    
    def get_users(self, id=None):
        if id:
            ret = requests.get(urljoin(self.url, f"/fed/users/{id}"))
        else:
            ret = requests.get(urljoin(self.url, "/fed/users"))

        return ret.json()

    def get_timestamps(self, community):
        ret = requests.get(urljoin(self.url, f"/fed/communities/{community}/timestamps"))
        print(ret.status_code)
        if(ret.status_code != 200):
            return None
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts(self, community):
        ret = requests.get(urljoin(self.url, f"/fed/posts?community={community}"))
        return ret.json()

    def get_post_by_id(self, id):
        ret = requests.get(urljoin(self.url, f"/fed/posts/{id}")) 
        return ret.json()

    def get_communities(self, id=None):
        if id:
            ret = requests.get(urljoin(self.url, f"/fed/communities/{id}"))
        else:
            ret = requests.get(urljoin(self.url, "/fed/communities"))

        return ret.json()

    def create_post(self, data):
        data.pop("external")
        #print(requests.post(urljoin(self.url, f"/fed/posts"), json=data))
        return Response(status=requests.post(urljoin(self.url, f"/fed/posts"), json=data).status_code)
    
    def edit_post(self, data, id):
        data.pop("external")
        ret = requests.put(urljoin(self.url, f"/fed/posts/{id}"), json=data) 
        return ret.json()
    
    def delete_post(self, data, id):
        data.pop("external")
        ret = requests.delete(urljoin(self.url, f"/fed/posts/{id}")) 
        return ret.json()
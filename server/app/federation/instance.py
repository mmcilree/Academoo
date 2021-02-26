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

    def get_timestamps(self, community, headers):
        ret = requests.get(urljoin(self.url, f"/fed/communities/{community}/timestamps"), headers=headers)
        print(ret.status_code)
        if(ret.status_code != 200):
            return None
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts(self, community, headers):
        ret = requests.get(urljoin(self.url, f"/fed/posts?community={community}"), headers=headers)
        return ret.json()

    def get_post_by_id(self, id, headers):
        ret = requests.get(urljoin(self.url, f"/fed/posts/{id}"), headers=headers) 
        return ret.json()

    def get_communities(self, headers, id=None):
        if id:
            ret = requests.get(urljoin(self.url, f"/fed/communities/{id}"), headers=headers)
        else:
            ret = requests.get(urljoin(self.url, "/fed/communities"), headers=headers)
        return ret.json()

    def create_post(self, data, headers):
        data.pop("external")
        print("HERE IS HEADERS: " + str(headers))
        ret = requests.post(urljoin(self.url, f"/fed/posts"), json=data, headers=headers)
        return Response(status=ret.status_code)
    
    def edit_post(self, data, id, headers):
        data.pop("external")
        ret = requests.put(urljoin(self.url, f"/fed/posts/{id}"), json=data, headers=headers) 
        return ret.json()
    
    def delete_post(self, data, id, headers):
        data.pop("external")
        ret = requests.delete(urljoin(self.url, f"/fed/posts/{id}"), headers=headers) 
        return ret.json()
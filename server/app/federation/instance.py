import requests
from urllib.parse import urljoin
from flask import jsonify, Response, current_app
from app.digital_signatures import generate_digest, generate_signature
from datetime import datetime
import json
from utils import *

def get_date():
    return datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT")

def get_signature(body):
    s = 'keyId="rsa-global",algorithm="hs2019",headers="(request-target) host client-host user-id date digest",signature="{}"'
    return s.format(generate_signature(body))

class Instance(object):
    
    def __init__(self, url):
        self.url = url

        # Possibly the worst signature specification possible
        self.request_data = """(request-target): {req}
host: cs3099user-a1.host.cs.st-andrews.ac.uk
client-host: cs3099user-a1.host.cs.st-andrews.ac.uk
user-id: {user_id}
date: {date}
digest: {digest}
"""

        self.request_data_without_user_id = """(request-target): {req}
host: cs3099user-a1.host.cs.st-andrews.ac.uk
client-host: cs3099user-a1.host.cs.st-andrews.ac.uk
date: {date}
digest: {digest}
"""
    
    def get_users(self, id=None):
        body = self.request_data_without_user_id.format(
            req="get /fed/users", 
            date=get_date(),
            digest=generate_digest("")
        )

        headers = {
            "Signature": get_signature(body)
        }

        ret = None
        if id:
            ret = requests.get(urljoin(self.url, f"/fed/users/{id}"), headers=headers)
        else:
            ret = requests.get(urljoin(self.url, "/fed/users"), headers=headers)

        try:
            json.loads(ret.content)
            if check_array_json(ret.json()): return check_array_json(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)

    def get_timestamps(self, community, headers):
        body = self.request_data.format(
            req=f"get /fed/communities/{community}/timestamps",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest("")
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.get(urljoin(self.url, f"/fed/communities/{community}/timestamps"), headers=headers)
        if(ret.status_code != 200):
            return None
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts(self, community, headers):
        body = self.request_data.format(
            req=f"get /fed/posts?community={community}",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest("")
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)
        
        # print(headers)

        ret = requests.get(urljoin(self.url, f"/fed/posts?community={community}"), headers=headers)
        if check_get_filtered_post(ret.json()): return check_get_filtered_post(ret.json())
        return ret.json(), ret.status_code

    def get_post_by_id(self, id, headers):
        body = self.request_data.format(
            req=f"get /fed/posts/{id}",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest("")
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.get(urljoin(self.url, f"/fed/posts/{id}"), headers=headers)
        if check_get_post(ret.json()): return check_get_post(ret.json())
        return ret.json(), ret.status_code

    def get_communities(self, headers, id=None):
        body = self.request_data.format(
            req=f"get /fed/communities",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest("")
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        if id:
            ret = requests.get(urljoin(self.url, f"/fed/communities/{id}"), headers=headers)
            if check_get_community(ret.json()): return check_get_community(ret.json())
        else:
            ret = requests.get(urljoin(self.url, "/fed/communities"), headers=headers)
            if check_array_json(ret.json()): return check_array_json(ret.json())

        return jsonify(ret.json()), ret.status_code

    def create_post(self, data, headers):
        data.pop("external")

        body = self.request_data.format(
            req=f"post /fed/posts",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest(str(data))
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.post(urljoin(self.url, f"/fed/posts"), json=data, headers=headers)
        try:
            json.loads(ret.content)
            if check_is_error_message(ret.json()): return check_is_error_message(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)
    
    def edit_post(self, data, id, headers):
        data.pop("external")

        body = self.request_data.format(
            req=f"put /fed/posts/{id}",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest(str(data))
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.put(urljoin(self.url, f"/fed/posts/{id}"), json=data, headers=headers)
        try:
            json.loads(ret.content)
            if check_is_error_message(ret.json()): return check_is_error_message(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)
    
    def delete_post(self, data, id, headers):
        data.pop("external")

        body = self.request_data.format(
            req=f"delete /fed/posts/{id}",
            user_id= headers["User-ID"],
            date=get_date(),
            digest=generate_digest(str(data))
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.delete(urljoin(self.url, f"/fed/posts/{id}"), headers=headers) 
        try:
            json.loads(ret.content)
            if check_is_error_message(ret.json()): return check_is_error_message(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)
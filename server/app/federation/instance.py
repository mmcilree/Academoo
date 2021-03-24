import requests
from urllib.parse import urljoin, urlparse
from flask import jsonify, Response, current_app
from app.digital_signatures import generate_digest, generate_signature
from datetime import datetime
from utils import *
import json

import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature


def get_date(): # just why this instead of timestamp like a normal person??
    return datetime.utcnow().strftime("%a, %d %b %Y %H:%M:%S GMT")

def get_signature(body):
    body = bytes(body, "utf-8")
    s = 'keyId="rsa-global",algorithm="hs2019",headers="(request-target) host client-host user-id date digest",signature="{}"'
    return s.format(generate_signature(body))

class Instance(object):
    def __init__(self, url):
        self.url = url
        self.public_key = None
        self.get_public_key()

        # Possibly the worst signature specification possible
        self.request_data = "\n".join(
            (
                "(request-target): {req}", 
                "host: {url}", # this needs changing probs
                "client-host: {url}", 
                "user-id: {user_id}", 
                "date: {date}", 
                "digest: {digest}"
            )
        )
    
    def get_public_key(self):
        # Getting the instance's public key
        req = requests.get(urljoin(self.url, "/fed/key"))
        if req.status_code == 200: 
            self.public_key = req.content; return True
        
        return False

    def verify_signature(self, encoded_signature, request_target, headers, body):
        if not self.public_key and not self.get_public_key(): return False

        message = self.request_data.format(
            req=request_target,
            user_id=headers.get("User-ID"),
            date=get_date(), # what to do about latency?
            digest=generate_digest(body),
            url=urlparse(self.url).netloc
        )

        public_key = serialization.load_pem_public_key(self.public_key)
        decoded_signature = base64.b64decode(encoded_signature)

        try:
            public_key.verify(
                decoded_signature,
                bytes(message, "utf-8"),
                padding.PKCS1v15(),
                hashes.SHA512()
            )
        except InvalidSignature:
            return False

        return True
    
    def get_users(self, id=None):
        body = self.request_data.format(
            req="get /fed/users", 
            user_id=None,
            date=get_date(),
            digest=generate_digest(b""),
            url=current_app.config["HOST"]
        )

        headers = {"Signature": get_signature(body)}

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
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(b""),
            url=current_app.config["HOST"]
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.get(urljoin(self.url, f"/fed/communities/{community}/timestamps"), headers=headers)
        if(ret.status_code != 200):
            return None
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts(self, community, headers):
        body = self.request_data.format(
            req=f"get /fed/posts",
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(b""),
            url=current_app.config["HOST"]
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)
        
        ret = requests.get(urljoin(self.url, f"/fed/posts?community={community}"), headers=headers)
        if check_get_filtered_post(ret.json()): return check_get_filtered_post(ret.json())
        return ret.json(), ret.status_code

    def get_post_by_id(self, id, headers):
        body = self.request_data.format(
            req=f"get /fed/posts/{id}",
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(b""),
            url=current_app.config["HOST"]
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.get(urljoin(self.url, f"/fed/posts/{id}"), headers=headers)
        if check_get_post(ret.json()): return check_get_post(ret.json())
        return ret.json(), ret.status_code

    def get_communities(self, headers, id=None):
        body = self.request_data.format(
            req=f"get /fed/communities",
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(b""),
            url=current_app.config["HOST"]
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)
        print(headers)
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
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(bytes(str(data), "utf-8")),
            url=current_app.config["HOST"]
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
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(bytes(str(data), "utf-8")),
            url=current_app.config["HOST"]
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
            user_id=headers.get("User-ID"),
            date=get_date(),
            digest=generate_digest(bytes(str(data), "utf-8")),
            url=current_app.config["HOST"]
        )

        if current_app.config["SIGNATURE_FEATURE"]: headers["Signature"] = get_signature(body)

        ret = requests.delete(urljoin(self.url, f"/fed/posts/{id}"), headers=headers) 
        try:
            json.loads(ret.content)
            if check_is_error_message(ret.json()): return check_is_error_message(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)
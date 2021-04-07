import requests
from urllib.parse import urljoin, urlparse
from flask import jsonify, Response, current_app
from app.digital_signatures import generate_digest, generate_signature
from datetime import datetime
from datetime import timezone
from utils import *
import json

import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidSignature

# https://stackoverflow.com/questions/41295142/is-there-a-way-to-globally-override-requests-timeout-setting
class TimeoutRequestsSession(requests.Session):
    def request(self, *args, **kwargs):
        kwargs.setdefault('timeout', 2)
        return super(TimeoutRequestsSession, self).request(*args, **kwargs)

requests = TimeoutRequestsSession()

def get_date(): # just why this instead of timestamp like a normal person??
    return datetime.now(tz=timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")

# NOTE: Some comments about the security protocol
# What's the difference between host and client-host?
# Why can't we have a nested json object instead of this string below that is so so complicated to parse
# Date should really be a timestamp instead of a readable format. Only computers will look at this..
# Also, what will happen when there is a >1second latency? The signature generated will be different because of the date
# For consistency, can we not omit User-ID in the body to sign? It's so difficult to remove this cleanly from the string. 
# Lastly, what do we generate digest from when it's a GET request? For now I just digest an empty string. 
def get_signature(body, user_id=None):
    body = bytes(body, "utf-8")
    if(user_id):
        s = 'keyId="rsa-global",algorithm="hs2019",headers="(request-target) host client-host user-id date digest",signature="{sig}"'
    else:
        s = 'keyId="rsa-global",algorithm="hs2019",headers="(request-target) host client-host date digest",signature="{sig}"'
        
    return s.format(sig=generate_signature(body))

class Instance(object):
    def __init__(self, url):
        self.url = url
        self.disabled = False

        self.public_key = None
        self.get_public_key()

        # Possibly the worst signature specification possible
        self.request_data = "\n".join(
            (
                "(request-target): {req}", 
                "host: {url}", # this needs changing probs
                "client-host: {client_host}", 
                "user-id: {user_id}", 
                "date: {date}", 
                "digest: SHA-512={digest}"
            )
        )

        self.request_data_without_user = "\n".join(
            (
                "(request-target): {req}", 
                "host: {url}", # this needs changing probs
                "client-host: {client_host}", 
                "date: {date}", 
                "digest: SHA-512={digest}"
            )
        )
    
    def __repr__(self):
        return f"(URL: {self.url}, PUB-KEY: {self.public_key})"
    
    def get_public_key(self):
        # Getting the instance's public key
        try:
            req = requests.get(urljoin(self.url, "/fed/key"), timeout=3)
            if req.status_code == 200: 
                self.disabled = False
                self.public_key = req.content; return True
        except: self.disabled = True

        return False
    
    def get_request_data(self, request_target, user_id=None, body=b""):
        date = get_date()
        if user_id:
            ret = self.request_data.format(
                req=request_target,
                user_id=user_id,
                date=date,
                digest=generate_digest(body),
                url=urlparse(self.url).netloc,
                client_host=current_app.config["HOST"]
            )
        else:
            ret = self.request_data_without_user.format(
                req=request_target,
                date=date,
                digest=generate_digest(body),
                url=urlparse(self.url).netloc,
                client_host=current_app.config["HOST"]
            )

        print(f"Sending {request_target}"); print(ret)

        return (ret, generate_digest(body), date)

    def verify_signature(self, encoded_signature, request_target, headers, body):
        if not self.public_key and not self.get_public_key(): return False
        date = get_date()

        if headers.get("User-ID"):
            message = self.request_data.format(
                req=request_target,
                user_id=headers.get("User-ID"),
                date=headers.get("Date", date),
                digest=generate_digest(body),
                url=current_app.config["HOST"],
                client_host=urlparse(self.url).netloc
            )
        else:
            message = self.request_data_without_user.format(
                req=request_target,
                date=headers.get("Date", date),
                digest=generate_digest(body),
                url=current_app.config["HOST"],
                client_host=urlparse(self.url).netloc
            )

        print("Expected Message:"); print(message)

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
        request_target = f"/fed/users/{id}" if id else f"/fed/users"
        (body, digest, date) = self.get_request_data(request_target)
        headers = {"Signature": get_signature(body, None), "Digest": "sha-512=" + digest, "Date": date}
        if id:
            ret = requests.get(urljoin(self.url, f"/fed/users/{id}"), headers=headers)
        else:
            ret = requests.get(urljoin(self.url, "/fed/users"), headers=headers)

        try:
            json.loads(ret.content)
            if id and check_get_user(ret.content): return check_get_user(ret.content)
            if not id and check_array_json(ret.content): return check_array_json(ret.content)
            
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)

    def get_timestamps(self, community, headers):
        body, digest, date = self.get_request_data(f"get /fed/communities/{community}/timestamps", headers.get("User-ID"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        ret = requests.get(urljoin(self.url, f"/fed/communities/{community}/timestamps"), headers=headers)
        if(ret.status_code != 200):
            return None
        return ret.json()

    # If the timestamp is different, then the cache is invalidated
    def get_posts(self, community, headers):
        body, digest, date = self.get_request_data(f"get /fed/posts", headers.get("User-ID"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        ret = requests.get(urljoin(self.url, f"/fed/posts?community={community}"), headers=headers)
        if check_get_filtered_post(ret.content): return check_get_filtered_post(ret.content)
        return ret.json(), ret.status_code

    def get_post_by_id(self, id, headers):
        body, digest, date = self.get_request_data(f"get /fed/posts/{id}", headers.get("User-ID"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        ret = requests.get(urljoin(self.url, f"/fed/posts/{id}"), headers=headers)
        if check_get_post(ret.content): return check_get_post(ret.content)
        return ret.json(), ret.status_code

    def get_communities(self, headers, id=None):
        request_target = f"get /fed/communities/{id}" if id else f"get /fed/communities"
        body, digest, date = self.get_request_data(request_target, headers.get("User-ID"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        if id:
            ret = requests.get(urljoin(self.url, f"/fed/communities/{id}"), headers=headers)
            if check_get_community(ret.content): return check_get_community(ret.content)
        else:
            ret = requests.get(urljoin(self.url, "/fed/communities"), headers=headers)
            if check_array_json(ret.content): return check_array_json(ret.content)

        return jsonify(ret.json()), ret.status_code


    def create_post(self, data, headers):
        data.pop("external")

        body, digest, date = self.get_request_data(f"post /fed/posts", headers.get("User-ID"), bytes(str(data), "utf-8"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        ret = requests.post(urljoin(self.url, f"/fed/posts"), json=data, headers=headers)
        try:
            json.loads(ret.content)

            # Create and Edit posts take in json instead of bytes...
            if check_create_post(ret.json()): return check_create_post(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)
    
    def edit_post(self, data, id, headers):
        data.pop("external")

        body, digest, date = self.get_request_data(f"put /fed/posts/{id}", headers.get("User-ID"), bytes(str(data), "utf-8"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        ret = requests.put(urljoin(self.url, f"/fed/posts/{id}"), json=data, headers=headers)
        try:
            json.loads(ret.content)
            if check_edit_post(ret.json()): return check_edit_post(ret.json())
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)
    
    def delete_post(self, data, id, headers):
        # data.pop("external")

        body, digest, date = self.get_request_data(f"delete /fed/posts/{id}", headers.get("User-ID"), bytes(str(data), "utf-8"))
        headers["Signature"] = get_signature(body, headers.get("User-ID"))
        headers["Digest"] = "sha-512=" + digest
        headers["Date"] = date

        ret = requests.delete(urljoin(self.url, f"/fed/posts/{id}"), headers=headers) 
        try:
            json.loads(ret.content)
            if check_is_error_message(ret.content): return check_is_error_message(ret.content)
            return jsonify(ret.json()), ret.status_code
        except:
            return Response(status=ret.status_code)

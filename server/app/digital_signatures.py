import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from flask.globals import current_app
from urllib.parse import urlparse

import app # circular imports :(

# def verify_signature(encoded_signature, pkey):
#     ok = b"""(request-target): get /fed/posts?community=General
# host: cs3099user-a1.host.cs.st-andrews.ac.uk
# client-host: cs3099user-a1.host.cs.st-andrews.ac.uk
# user-id: nnv2
# date: Tue, 23 Mar 2021 14:23:01 GMT
# digest: z4PhNX7vuL3xVChQ1m2AB9Yg5AULVxXcg/SpIdNs6c5H0NE8XYXysP+DGNKHfuwvY7kxvUdBeoGlODJ6+SfaPg=="""

#     public_key = serialization.load_pem_public_key(pkey)

#     decoded_signature = base64.b64decode(encoded_signature)
#     ret = public_key.verify(
#         decoded_signature,
#         ok,
#         padding.PKCS1v15(),
#         hashes.SHA512()
#     )

#     print(ret)

def verify_request(headers, request_target, body=b""):
    if not current_app.config["SIGNATURE_FEATURE"]: return None, 200

    # Authentication Check
    if headers.get("Authorization"):
        token = app.guard.read_token_from_header()
        app.guard.extract_jwt_token(token)
    else:
        # Otherwise, perform a signature check
        host = headers.get("Client-Host")

        # If host is not known, then add it to the manager public key tracker
        instance = app.instance_manager.url_to_instance.get(host)
        if not instance:
            instance = app.federation.instance.Instance(urlparse(host, "http").geturl())
            app.instance_manager.url_to_instance[urlparse(host).netloc] = instance

        signature = headers.get("Signature")

        if not host or not signature: return {"title": "Bad Request", "message": "Signature Missing"}, 400

        signature = signature.split("signature=")[-1].replace('"', '') # zzzzz
        
        if not instance.verify_signature(signature, request_target, headers, body=body):
            return {"title": "Permission Denied", "message": "Invalid Signature"}, 403
        
    return None, 200

def generate_signature(body):
    with open("../.ssh/private.pem", "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
        )

    signature = private_key.sign(
        body,
        padding.PKCS1v15(),
        hashes.SHA512()
    )

    # Signature: keyId="rsa-global",algorithm="hs2019",headers="(request-target) host client-host user-id date digest",signature="<base64_signature>"
    return base64.b64encode(signature).decode("ascii")

def generate_digest(body):
    digest = hashes.Hash(hashes.SHA512())
    digest.update(body)

    base64encoded = base64.b64encode(digest.finalize())

    return base64encoded.decode("ascii")

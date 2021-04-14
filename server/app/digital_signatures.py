import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from flask.globals import current_app
from utils import format_url
from urllib.parse import urlparse
import app

# Verify the incoming request, returns appropriate error message when invalid
def verify_request(headers, request_target, body=b""):
    if not current_app.config["SIGNATURE_FEATURE"]: return None, 200

    # Authentication Check
    if headers.get("Authorization"):
        token = app.guard.read_token_from_header()
        app.guard.extract_jwt_token(token)
    else:
        # Otherwise, perform a signature check
        host = headers.get("Client-Host")
        if not host: host = headers.get("Host")

        # If host is not known, then add it to the manager public key tracker
        instance = app.instance_manager.url_to_instance.get(host)
        if not instance:
            url = format_url(host)
            instance = app.federation.instance.Instance(url)
            app.instance_manager.url_to_instance[urlparse(url).netloc] = instance

        signature = headers.get("Signature")

        if not host or not signature: return {"title": "Bad Request", "message": "Signature Missing"}, 400

        signature = signature.split("signature=")[-1].replace('"', '')
        
        if not instance.verify_signature(signature, request_target, headers, body=body):
            return {"title": "Permission Denied", "message": "Invalid Signature"}, 403
        
    return None, 200

# Given a message, sign the message and return the encoded signature
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

    return base64.b64encode(signature).decode("ascii")

# Given a content body, return the SHA512 digest of the body
def generate_digest(body):
    digest = hashes.Hash(hashes.SHA512())
    digest.update(body)

    base64encoded = base64.b64encode(digest.finalize())

    return base64encoded.decode("ascii")

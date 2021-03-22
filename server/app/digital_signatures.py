import base64
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding

def generate_signature(body):
    with open("../.ssh/private", "rb") as key_file:
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
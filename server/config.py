import os
from cryptography.hazmat.primitives import serialization

basedir = os.path.abspath(os.path.dirname(__file__))

def get_pub_key():
    with open("../.ssh/private.pem", "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
        )

        public_key = private_key.public_key()
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

    return pem.decode("utf-8")

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'spicy-secret'

    # Using SQLite as default database when one isn't defined
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_ACCESS_LIFESPAN = {'hours': 24}
    JWT_REFRESH_LIFESPAN = {'days': 30}

    PUBLIC_KEY = get_pub_key()
    SIGNATURE_FEATURE = True
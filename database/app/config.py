import os

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config(object):
    SQLALCHEMY_DATABASE_URI = 'postgresql:///' + os.path.join(basedir, 'app')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
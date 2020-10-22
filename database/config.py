import os

basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config(object):
    SQLALCHEMY_DATABASE_URI = 'NOT_DECIDED:///' + os.path.join(basedir, 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
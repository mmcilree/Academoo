from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import unittest

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    ELASTICSEARCH_URL = None

class UserCase(unittest.TestCase):
    def set_up(self):
        pass

    def tear_down(self):
        pass


if __name__ == '__main__':
    unittest.main(verbosity=2)
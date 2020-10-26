from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import pytest

class TestConfig(object):
    TESTING = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    ENV = 'test'
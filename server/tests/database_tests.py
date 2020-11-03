from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
import pytest

class TestConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'
    ELASTICSEARCH_URL = None
#from app.models import User, Community, Post, UserRole, getTime ////circular import error
import json
from uuid import UUID
import re
import jsonschema
from jsonschema import validate
from flask import jsonify

def adminMatchesKey(key):
    secret_key = "lh87GFL3DHkkMsw098An"
    if key == secret_key:
        return True
    else:
        return False

def isUUID(val):
    try:
        UUID(val)
        return True
    except ValueError:
        return False

def no_valid_json_error():
    return (jsonify({"title": "Expected to find JSON file returned, no JSON found", "message": "No JSON response was returned from external server request"}), 500)


def validate_username(username):
    if not re.match("^[a-zA-Z0-9-_]{1,24}$", username):
        return ({"title": "Invalid username", "message": "username does not match expected pattern <^[a-zA-Z0-9-_]{1,24}$>"}, 400)


def validate_community_id(community_id):
    if not re.match("^[a-zA-Z0-9-_]{1,24}$", community_id):
        return ({"title": "Invalid community id", "message": "community id does not match expected pattern <^[a-zA-Z0-9-_]{1,24}$>"}, 400)


def validate_role(role):
    available_roles = ["admin", "contributor", "member", "guest", "prohibited"]
    if role not in available_roles:
        return ({"title": "Invalid role name", "message": "available  roles are admin, contributor, member, guest, prohibited"}, 400)


def validate_post_id(post_id):
    if not isUUID(post_id):
        return ({"title": "post id is not in the correct format", "message": "Format of post id should be uuid4 string"}, 400)

def validate_json(file): # IS REDUNDANT, REMOVE EVENTUALLY
    if file is None:
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file is properly formatted"}, 400)

content_schema = {
    "type": "array",
    "items": {
        "type": "object",
        "patternProperties": {
            "^.*$": {
                "type": "object",
                "patternProperties": {
                    "^.*$": {"type": "string"}
                }
            }
        }
    }
}

def check_array_json(file):
    schema = {
        "type": "array",
        "items": {"type": "string"}
    }
    try:
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

def check_get_community(file):
    schema = {
        "type": "object",
        "properties": {
            "id": {"type": "string"},
            "title": {"type": "string"},
            "description": {"type": "string"},
            "admins": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "host": {"type": "string"}
                    },
                    "required": ["id", "host"]
                }
            }
        },
        "required": ["id", "title", "description", "admins"]
    }
    try:
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

def check_is_error_message(file):
    schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "message": {"type": "string"}
        },
        "required": ["title", "message"]
    }
    try:
        print(str(file))
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        return ({"title": "Invalid JSON file passed", "message": "Make sure the JSON file conforms to protocol schema"}, 400)

def check_get_timestamps(file):
    schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "modified": {"type": "integer"}
            },
            "required": ["id", "modified"]
        }
    }
    try:
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

def check_get_filtered_post(file):
    schema = {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "community": {"type": "string"},
                "parentPost": {"type": ["string", "null"], "default": "null"},
                "children": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "title": {"type": "string"},
                "content": content_schema,
                "author": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "host": {"type": "string"}
                    },
                    "required": ["id", "host"]
                },
                "modified": {"type": "integer"},
                "created": {"type": "integer"}
            },
            "required": ["id", "community", "children", "title", "content", "author", "modified", "created"]
        }
    }
    try:
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        print("Failed filtered post validation")
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

def check_get_post(file):
    schema = {
            "type": "object",
            "properties": {
                "id": {"type": "string"},
                "community": {"type": "string"},
                "parentPost": {"type": ["string", "null"], "default": "null"},
                "children": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "title": {"type": "string"},
                "content": content_schema,
                "author": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "host": {"type": "string"}
                    },
                    "required": ["id", "host"]
                },
                "modified": {"type": "integer"},
                "created": {"type": "integer"}
            },
            "required": ["id", "community", "children", "title", "content", "author", "modified", "created"]
        }
    try:
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        print(str(file))
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

def check_get_user(file):
    schema = {
        "type": "object",
        "properties": {
            "id": {"type": "string"},
            "about": {"type": "string"},
            "avatarUrl": {"type": "string"},
            "posts": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "host": {"type": "string"}
                    },
                    "required": ["id", "host"]
                }
            }
        },
        "required": ["id", "posts"]
    }
    try:
        to_json = json.loads(file)
        validate(instance=to_json, schema=schema)
    except:
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

def check_create_post(file):
    create_schema = {
        "type": "object",
        "properties": {
            "community": {"type": "string"},
            "parentPost": {"type": ["string", "null"], "default": "null"},
            "title": {"type": "string"},
            "content": content_schema
        },
        #"additionalProperties": False,
        "required": ["community", "title", "content"]
    }

    try:
        validate(instance=file, schema=create_schema)
    except:
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)
    

def check_edit_post(file):
    edit_schema = {
        "type": "object",
        "properties": {
            "title": {"type": "string"},
            "content": content_schema
        },
        #"additionalProperties": False,
        "required": ["title", "content"]
    }
    
    try:
        validate(instance=file, schema=edit_schema)
    except:
        check_error = check_is_error_message(file)
        if check_error is not None:
            return check_error
        return ({"title": "Invalid JSON file passed", "message": "Make sure JSON file conforms to protocol schema"}, 400)

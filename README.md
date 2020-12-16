# CS3099 Group Project Code

## Commit Message Conventions 

We are using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). 

Please adhere to the format described in the above link for all commit messages. 

*TL;DR*

Commit messages should be of the form:

```
<type>: <description>
```

where \<type> is one of:

- **feat**: for adding a new feature.
- **ci**: for changes to Continuous Integration pipeline. 
- **fix**: for fixing a bug.
- **chore**: for updating grunt tasks etc; no production code change.
- **docs**: for documentation-only changes.
- **perf**: for improving performance.
- **refactor**: for code changes that neither fixes a bug nor adds a feature.
- **style**: for changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **test**: for adding missing tests or correcting existing tests.
- **build**: for changes that affect the build system or external dependencies.

## React Naming Conventions

We are using the react naming conventions similar to those adoped by [Airbnb](https://github.com/airbnb/javascript/tree/master/react#naming).

- **Component Names**: PascalCase
- **Component File Names**: PascalCase.jsx
- **Component Instances**: camelCase
- **Prop Names**: camelCase except if it is a component, in which case PascalCase
- **Quotes**: Double Quotes ("") for all JSX attributes and Single Quotes ('') for all other JS. 
- **Spacing**: Single space in <SelfClosing /> tags. Embedded JS should be {unpadded}

## When starting the backend for the first time:

```
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt

flask db init
flask db upgrade
```
to be continued...

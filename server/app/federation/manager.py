import functools
from app.federation.instance import Instance


class Manager(object):
    def __init__(self):
        # host name : <Instance Objects>
        self.instances = {
            # "nnv2host": Instance("https://nnv2.host.cs.st-andrews.ac.uk/")
        }

    def create_post(self, host, data):
        self.instances[host].create_post(data)

    def _get_latest_timestamp(self, host, community):
        return max([x["modified"] for x in self.instances[host].get_timestamps(community)] + [0])

    @functools.lru_cache() # timestamp purely for caching purposes
    def _get_posts(self, host, community, _timestamp):
        return self.instances[host].get_posts(community)

    def get_post_by_id(self, host, id):
        return self.instances[host].get_post_by_id(id=id)

    def get_posts(self, host, community):
        timestamp = self._get_latest_timestamp(host, community)
        return self._get_posts(host, community, timestamp)

    def get_communities(self, host, id=None):
        return self.instances[host].get_communities(id=id)

    def get_instances(self):
        return list(self.instances.keys())

    def add_instance(self, host, url):
        if host in self.instances:
            return False

        self.instances[host] = Instance(url)
        return True

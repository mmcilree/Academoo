function promiseJson(jsonValue) {
    return Promise.resolve({
        json: () => Promise.resolve(
            jsonValue
        ),
        ok: true
    });
}
export const fetchMock =
    (path) => {
        if (path === "/api/get-instances") {
            return promiseJson(["instance1", "instance2", "instance3"]);
        } else if (path.startsWith("/api/communities")) {
            return promiseJson(["community1", "community2", "community3"]);
        } else if (path.startsWith("/api/users")) {
            return promiseJson(["user1", "user2", "user3, user4"]);
        } else if (path.startsWith("api/get-community-roles")) {
            return promiseJson({
                admins: ["academoo"],
                contributors: ["user2"],
                members: ["user3, user4"],
                guests: ["user1"],
                prohibited: [],
            })

        } else if (path.startsWith("api/get-default-role")) {
            return promiseJson("contributor");
        } else {
            return promiseJson({});
        }

    };

export const authFetchMock =
    (path) => {
        return promiseJson({
            id: "academoo",
            email: "academoo@academoo.com",
            host: "academoo",
            site_roles: "site-admin",
            subscriptions: ["community1", "community2", "community3"]
        })
    };



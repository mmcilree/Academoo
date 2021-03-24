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
            return promiseJson(["user1", "user2", "user3"]);
        } else if (path.startsWith("/api/get-community-roles")) {
            return promiseJson({
                admins: ["academoo"],
                contributors: ["user2"],
                members: ["user3, user4"],
                guests: ["user1"],
                prohibited: [],
            })
        } else {
            return promiseJson({});
        }

    };

export const authFetchMock =
    (path) => {
        if (path === "/api/get-instances") {
            return promiseJson(["instance1", "instance2", "instance3"]);
        } else if (path.startsWith("/api/communities")) {
            return promiseJson(["community1", "community2", "community3"]);
        } else if (path.startsWith("/api/users")) {
            return promiseJson(["user1", "user2", "user3"]);
        } else if (path.startsWith("/api/get-community-roles")) {
            return promiseJson({
                admins: ["academoo"],
                contributors: ["user2"],
                members: ["user3, user4"],
                guests: ["user1"],
                prohibited: [],
            })
        } else if (path.startsWith("/api/get-user")) {
            return promiseJson({
                id: "academoo",
                email: "academoo@academoo.com",
                host: "academoo",
                site_roles: "site-admin",
                adminOf: ["community1"],
                subscriptions: ["community1", "community2", "community3"]
            });
        } else if (path.startsWith("/api/get-default-role")) {
            return promiseJson({ default_role: "contributor" });
        } else if (path.startsWith("/api/posts/")) {
            return promiseJson(    {
                author: {
                    host: "Academoo",
                    id: "user3"
                },
                children: [],
                community: "community1",
                content: [{ text: { text: "A new post!" } }],
                created: 1615911509,
                id: "f3bf4744-bea3-493b-a15f-7745f7006df4",
                modified: 1615911509,
                parentPost: null,
                title: "Most Recent Post"
            })
        } else {
            return promiseJson([]);
        }
    }


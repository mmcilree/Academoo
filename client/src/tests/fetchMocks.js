function promiseJson(jsonValue) {
    return Promise.resolve({
        json: () => Promise.resolve(
            jsonValue
        )
    });
}
export const fetchMock =
    (path) => {
        if (path === "/api/get-instances") {
            return promiseJson(["instance1", "instance2", "instance3"]);
        } else if (path.startsWith("/api/communities")) {
            return promiseJson(["community1", "community2", "community3"]);
        } else {
            return promiseJson({});
        }

    };

export const authFetchMock =
    (path) => {
        return promiseJson({
            id: "academoo",
            email: "academoo@academoo.com",
            host: "academoo"
        })
    };



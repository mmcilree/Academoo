export const fetchMock =
    (path) => {
        if (path === "/api/get-instances") {
            console.log("here?")
            return Promise.resolve({
                json: () => Promise.resolve(
                    ["instace1", "instace2", "instace3"]
                ),
                
            });
        } else {
            
            return Promise.resolve({
                json: () => Promise.resolve(
                    {}
                ),
                
            });
        }

    };




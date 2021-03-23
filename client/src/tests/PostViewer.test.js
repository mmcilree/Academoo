import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { mount } from "enzyme";
import { Router } from "react-router-dom";
import { ListGroupItem } from "react-bootstrap";
import { createMemoryHistory } from 'history';
import CommunityExplorer from "../components/community/CommunityExplorer";
import Post from "../components/posts/Post";
import PostsViewer from "../components/posts/PostsViewer";
import { fetchMock, authFetchMock } from './fetchMocks.js';

import each from 'jest-each';

// const App = require('../App').default;
let wrapper;

// Mock the necessary API calls for authentication
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

let posts = [
    {
        author: {
            host: "Academoo",
            id: "academoo"
        },
        children: [],
        community: "community1",
        content: [{ markdown: { text: "# hello!" } }],
        created: 1614086647,
        id: "7ccb13d5-507d-4412-805c-7a0cc93d562d",
        modified: 1614086647,
        parentPost: null,
        title: "Testing!"
    },
    {
        author: {
            host: "Academoo",
            id: "user1"
        },
        children: ["f3bf4744-bea3-493b-a15f-7745f7006df4"],
        community: "community1",
        content: [{ text: { text: "Hi everyone!" } }],
        created: 1615910508,
        id: "8ce7979c-ba62-40ff-b237-eb01d1b15231",
        modified: 1615910508,
        parentPost: null,
        title: "New test post"
    },
    {
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
    },
]


const history = createMemoryHistory();

beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/communities/community1')
    wrapper = mount(
        <Router history={history}>
            <PostsViewer posts={posts} />
        </Router>
    );
});


it("2 top-level posts displayed", (done) => {
    setTimeout(() => {
        try {
            wrapper.update();
            expect(wrapper.find(Post)).toHaveLength(3);
            done()
        } catch (error) {
            done(error);
        }
    }, 1000);
});


it("Post content is correct", (done) => {
    setTimeout(() => {
        try {
            wrapper.update();
            posts.map(post => {
                expect(wrapper.containsMatchingElement(<div>{post.title}</div>)).toEqual(true);
            })
            done()
        } catch (error) {
            done(error);
        }
    }, 1000);
});




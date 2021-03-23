import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount } from "enzyme";
import App from "../App";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import PostCreator from "../components/posts/PostCreator";
import { authFetchMock, fetchMock } from './fetchMocks';

import each from 'jest-each';

// const App = require('../App').default;
const auth = require('../auth');
let wrapper;
let titleField;
let bodyField;
let communityField;
let submitButton;
let postCreator;

// Mock the necessary API calls for authentication
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);


const history = createMemoryHistory();

function setFormDataAndSubmit(title, body, host, community) {
    titleField.simulate('change', { target: { name: "title", value: title } })
    bodyField.simulate('change', { target: { name: "body", value: body } })
    postCreator.setState({selected: [{host: host, community: community}]});
    submitButton.simulate('submit');
    
}

beforeEach(() => {
    global.fetch = jest.fn().mockImplementation(fetchMock);

    history.push('/create-post')
    wrapper = mount(
        <Router history={history}>
            <PostCreator />
        </Router>
    );


    wrapper.update();

    titleField = wrapper.find('[name="title"]').hostNodes();
    bodyField = wrapper.find('[name="body"]').hostNodes();
    communityField = wrapper.find('.community-choice').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    postCreator = wrapper.find(PostCreator);

});


it("Creates basic post", () => {
    setFormDataAndSubmit("A post", "The post body", "instance1", "community1");
    expect(postCreator.state().errors).toHaveLength(0);
});

describe('PostCreator form is valid', () => {
    it.each`
    title           | body                  | host          | community
    ${"Title1"}     | ${"This is a post"}   | ${"instance1"}| ${"community1"}
    ${"$%£@£$@"}    | ${""}                 | ${"instance2"}| ${"community2"}
    ${"t"}          | ${"t"}                | ${"instance3"}| ${"community1"}
    ${"Very long multiple word title that nevertheless should still be valid"} | ${"banana"} | ${"instance1"}| ${"community1"}
  `('for input [$title, $body, $host, $community]', ({ title, body, host, community }) => {
        setFormDataAndSubmit(title, body, host, community);
        expect(postCreator.state().errors).toHaveLength(0);
    });
});

describe('PostCreator form is invalid (empty title)', () => {
    it.each`
    title           | body                  | host          | community
    ${""}           | ${"This is a post"}   | ${"instance1"}| ${"community1"}
    ${""}           | ${""}                 | ${"instance2"}| ${"community2"}
    ${""}           | ${"t"}                | ${"instance3"}| ${"community1"}
    ${""}           | ${"banana"}           | ${"instance1"}| ${"community1"}
  `('for input [$title, $body, $host, $community]', ({ title, body, host, community }) => {
        setFormDataAndSubmit(title, body, host, community);
        
        expect(postCreator.state().errors).toContain("Title field cannot be empty")
    });
});

describe('PostCreator form is invalid (community does not exist)', () => {
    it.each`
    title           | body                  | host          | community
    ${"Title1"}     | ${"This is a post"}   | ${"instance1"}| ${""}
    ${"$%£@£$@"}    | ${""}                 | ${"instance2"}| ${"notreal"}
    ${"t"}          | ${"t"}                | ${"instance3"}| ${"community6"}
    ${"Very long multiple word title that nevertheless should still be valid"} | ${"banana"} | ${"instance1"}| ${"bla"}
  `('for input [$title, $body, $host, $community]', ({ title, body, host, community }, done) => {
        setTimeout(() => {
            try {
                wrapper.update();
                setFormDataAndSubmit(title, body, host, community);
                expect(postCreator.state().errors).toContainEqual(<p>You haven't selected a pre-existing community. You can create new community <a href='./create-community'>here</a></p>)
                done();
            } catch (error) {
                
                done(error);
            }
        }, 1000);   
    });
});



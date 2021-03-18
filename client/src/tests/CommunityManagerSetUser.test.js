import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount, dive } from "enzyme";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import { Alert, Dropdown } from 'react-bootstrap'
import CommunityCreator from "../components/community/CommunityCreator";
import { fetchMock } from './fetchMocks.js';
import CommunityManager from "../components/community/CommunityManager";
import AccessForbidden from "../components/static/AccessForbidden";

let wrapper;
let instanceField;
let usernameField;
let roleField;
let instanceButton;
let submitButton;
let communityManager;

jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [true],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(instance, username, role) {
    instanceButton.simulate('click')
    instanceField.simulate('click', { instance })
    usernameField.simulate('change', { selected: [{ user: username }] })
    roleField.find({ key: role }).simulate('click', { role })
    submitButton.simulate('submit');
}

beforeEach(() => {
    // { initialEntries: ["/communities/community1/manage"] }
    const history = createMemoryHistory();
    global.fetch = jest.fn().mockImplementation(fetchMock);
    history.push('/communities/community1/manage')
    wrapper = mount(
        <Router history={history}>
            <CommunityManager match={{ params: { id: "community1" }, isExact: true, path: "", url: "" }} />
        </Router>
    );


    instanceButton = wrapper.find('[id="instance-selector"]').hostNodes()
    instanceField = wrapper.find(Dropdown.Item).hostNodes();
    usernameField = wrapper.find('[id="user-choice"]').hostNodes();
    roleField = wrapper.find('[id="role-selector"]').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    communityManager = wrapper.find(CommunityManager);
});

it('routes to community manager', () => {
    setTimeout(() => {
        console.log(wrapper.debug())
        expect(wrapper.find(CommunityManager)).toHaveLength(1);
    }, 1000);
})


describe('CommunityManager form is valid', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${"user1"}        | ${"admin"}
    ${"instance2"}      | ${"user2"}        | ${"contributor"}
    ${"instance3"}      | ${"user3"}        | ${"guest"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        // expect(communityManager.state().errors).toHaveLength(0)
        setTimeout(() => {
            setFormDataAndSubmit(instance, username, role);
            expect(wrapper.find(CommunityManager)).containsMatchingElement(<Alert variant="warning"></Alert>).to.equal(false);
        }, 1000);
    });
});

describe('CommunityManager form is invalid (blank fields)', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${""}        | ${"admin"}
    ${"instance2"}      | ${"user2"}   | ${""}
    ${"instance3"}      | ${""}        | ${""}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        // expect(communityManager.state().errors).toHaveLength(0)
        setTimeout(() => {
            setFormDataAndSubmit(instance, username, role);
            setFormDataAndSubmit(instance, username, role);
            expect(wrapper.find(CommunityManager)).containsMatchingElement(<Alert variant="warning" key="Required fields have been left blank."></Alert>).to.equal(true);
        }, 1000);
    });
});

describe('CommunityManager form is invalid (user tries to change own role)', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${"academoo"}     | ${"contributor"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        // expect(communityManager.state().errors).toHaveLength(0)
        setTimeout(() => {
            setFormDataAndSubmit(instance, username, role);
            expect(wrapper.find(CommunityManager)).containsMatchingElement(<Alert variant="warning" key="You cannot change your own role"></Alert>).to.equal(true);
        }, 1000);
    });
});
import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { shallow, mount, dive } from "enzyme";
import { Router, Route, Switch } from "react-router-dom";
import { createMemoryHistory } from 'history';
import { Alert, Dropdown } from 'react-bootstrap'
import { fetchMock } from './fetchMocks.js';
import ControlPanel from "../components/authentication/ControlPanel";
import AccessForbidden from "../components/static/AccessForbidden";

let wrapper;
let instanceField;
let usernameField;
let roleField;
let instanceButton;
let submitButton;
let controlPanel;

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
    history.push('/communities/control-panel')
    wrapper = mount(
        <Router history={history}>
            <ControlPanel />
        </Router>
    );


    instanceButton = wrapper.find('[id="instance-selector"]').hostNodes()
    instanceField = wrapper.find(Dropdown.Item).hostNodes();
    usernameField = wrapper.find('[id="user-choice"]').hostNodes();
    roleField = wrapper.find('[id="role-selector"]').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    controlPanel = wrapper.find(ControlPanel);
});

it('routes to community manager', () => {
    setTimeout(() => {
        console.log(wrapper.debug())
        expect(wrapper.find(ConrolPanel)).toHaveLength(1);
    }, 1000);
})


describe('Control Panel user roles form is valid', () => {
    it.each`
    instance            | username          | role
    ${"local"}          | ${"user1"}        | ${"site-admin"}
    ${"instance2"}      | ${"user2"}        | ${"site-moderator"}
    ${"instance3"}      | ${"user3"}        | ${"Remove-all"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        // expect(communityManager.state().errors).toHaveLength(0)
        setTimeout(() => {
            setFormDataAndSubmit(instance, username, role);
            expect(wrapper.find(ControlPanel)).containsMatchingElement(<Alert variant="warning"></Alert>).to.equal(false);
        }, 1000);
    });
});

describe('Control Panel user roles form is invalid (blank fields)', () => {
    it.each`
    instance            | username     | role
    ${"instance1"}      | ${""}        | ${"site-admin"}
    ${"instance2"}      | ${"user2"}   | ${""}
    ${"instance3"}      | ${""}        | ${""}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        setTimeout(() => {
            setFormDataAndSubmit(instance, username, role);
            setFormDataAndSubmit(instance, username, role);
            expect(wrapper.find(ControlPanel)).containsMatchingElement(<Alert variant="warning" key="Required fields have been left blank."></Alert>).to.equal(true);
        }, 1000);
    });
});

describe('Control Panel user roles form is invalid (user tries to change own role)', () => {
    it.each`
    instance            | username          | role
    ${"instance1"}      | ${"academoo"}     | ${"site-admin"}
  `('for input [$instance, $username, $role]', ({ instance, username, role }) => {
        setTimeout(() => {
            setFormDataAndSubmit(instance, username, role);
            expect(wrapper.find(ControlPanel)).containsMatchingElement(<Alert variant="warning" key="You cannot change your own role"></Alert>).to.equal(true);
        }, 1000);
    });
});
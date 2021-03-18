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
let roleField;
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

function setFormDataAndSubmit(role) {
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


    roleField = wrapper.find('[id="default-role-selector"]').hostNodes();
    submitButton = wrapper.find('[type="submit"]').hostNodes();
    communityManager = wrapper.find(CommunityManager);
});

it('routes to community manager', () => {
    setTimeout(() => {
        console.log(wrapper.debug())
        expect(wrapper.find(CommunityManager)).toHaveLength(1);
    }, 1000);
})


describe('CommunityManager default role form is valid', () => {
    it.each`
    role            
    ${"admin"}
    ${"contributor"}
    ${"member"}
    ${"guest"}
    ${"prohibited"}
  `('for input [$role]', ({ role }) => {
        // expect(communityManager.state().errors).toHaveLength(0)
        setTimeout(() => {
            setFormDataAndSubmit(role);
            expect(wrapper.find(CommunityManager)).containsMatchingElement(<Alert variant="warning"></Alert>).to.equal(false);
        }, 1000);
    });
});

describe('CommunityManager default role form is invalid (blank)', () => {
    it.each`
    role            
    ${""}
  `('for input [$role]', ({ role }) => {
        setTimeout(() => {
            setFormDataAndSubmit(role);
            expect(wrapper.find(CommunityManager)).containsMatchingElement(<Alert variant="warning" key="Required fields have been left blank."></Alert>).to.equal(true);
        }, 1000);
    });
});
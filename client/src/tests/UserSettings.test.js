import React from "react";
import { configure } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
configure({ adapter: new Adapter() });
import { mount } from "enzyme";
import { Router} from "react-router-dom";
import { createMemoryHistory } from 'history';
import UserSettings from "../components/user/UserSettings";

let wrapper;
let oldPassword;
let newPassword;
let submitButton;
let bioButton;
let settingsForm;
let newBio;
let username;
let password;
let deleteButton;

/*Tests to check that the user settings component works properly*/

const history = createMemoryHistory();
jest.mock('../auth', () => {
    const { authFetchMock } = require('./fetchMocks');
    return ({
        useAuth: () => [false],
        authFetch: authFetchMock
    })
}
);

function setFormDataAndSubmit(old, newP) {
    oldPassword.simulate('change', { target: { name: "oldPassword", value: old } })
    newPassword.simulate('change', { target: { name: "newPassword", value: newP } })
    submitButton.simulate('submit');
}

function setFormDataAndSubmitBio(bio) {
    newBio.simulate('change', { target: { name: "new_bio", value: bio } })
    bioButton.simulate('submit');
}

function setFormDataAndSubmitDeleteAccount(user, pass) {
    username.simulate('change', { target: { name: "confirmUsername", value: user } })
    password.simulate('change', { target: { name: "confirmPassword", value: pass } })
    deleteButton.simulate('submit');
}

beforeEach(() => {
    global.fetch =
        jest.fn().mockImplementation(() => {
            return Promise.resolve({
                ok: true,
            });
        });

    history.push('/user-settings')
    wrapper = mount(
        <Router history={history}>
            <UserSettings />
        </Router>
    );

    oldPassword = wrapper.find('[name="oldPassword"]').hostNodes();
    newPassword = wrapper.find('[name="newPassword"]').hostNodes();
    submitButton = wrapper.find('[name="settingsSubmit"]').hostNodes();
    newBio = wrapper.find('[name="new_bio"]').hostNodes();
    bioButton = wrapper.find('[name="bioSubmit"]').hostNodes();
    username = wrapper.find('[name="confirmUsername"]').hostNodes();
    password = wrapper.find('[name="confirmPassword"]').hostNodes();
    deleteButton=wrapper.find('[name="deleteButton"]').hostNodes();
    settingsForm = wrapper.find(UserSettings.WrappedComponent);
});

describe('Password change is valid', () => {
    it.each`
    old        |  newP
    ${"Test!1234"}     |  ${"Test!123"}
    ${"Test!123"} |  ${"aaaaaA1$"}
    ${"Test!123"}     |  ${"2BAAAAAa£"}
    ${"Test!123"}          |  ${"12345sS&"}
  `('for input [$old, $newP]', ({ old, newP }) => {
        setFormDataAndSubmit(old, newP);
        expect(settingsForm.state().errors).toHaveLength(0)
    });
});

describe('Password change is NOT valid', () => {
    it.each`
    old        |  newP
    ${"Test!1234"}     |  ${"Te"}
    ${"Test!123"} |  ${"aaaaa"}
    ${"Test!123"}     |  ${"2BAAA"}
    ${"Test!123"}          |  ${"12345"}
  `('for input [$old, $newP]', ({ old, newP }) => {
        setFormDataAndSubmit(old, newP);
        expect(settingsForm.state().errors).toHaveLength(1)
    });
});

describe('Bio change is valid', () => {
    it.each`
    bio        
    ${"New bio 1"}  
    ${"ARGHSSS 1234"} 
    ${"booooooo"}   
    ${"1234556677"}  
  `('for input [$bio]', ({ bio }) => {
        setFormDataAndSubmitBio(bio);
        expect(settingsForm.state().errors).toHaveLength(0)
    });
});

describe('Delete Account is valid', () => {
    it.each`
    usern        |  passw
    ${"ninab"}     |  ${"Test!123"}
    ${"ninabee1"} |  ${"aaaaaA1$"}
    ${"ninabee45"}     |  ${"2BAAAAAa£"}
    ${"testtest90"}          |  ${"12345sS&"}
  `('for input [$usern, $passw]', ({ usern, passw }) => {
        setFormDataAndSubmitDeleteAccount(usern, passw);
        expect(settingsForm.state().errors).toHaveLength(0)
    });
});

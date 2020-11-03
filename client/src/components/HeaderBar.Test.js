import React from 'react';
import { shallow, mount } from "enzyme";
import HeaderBar from './HeaderBar';

it("renders without crashing", () => {
  shallow(<HeaderBar />);
});
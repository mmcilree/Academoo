import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/NavDropdown";
import Dropdownbutton from "react-bootstrap/DropdownButton";
import Image from "react-bootstrap/Image";
import {logout} from "../auth";
import defaultProfile from "../images/default_profile.png";
import logo from "../images/logo.svg";
// import logo from "../images/logo.png";

import {
  PlusCircle,
  PersonCircle,
  Gear,
  BoxArrowRight,
} from "react-bootstrap-icons";

import { Link } from "react-router-dom";

class HeaderBar extends React.Component {
  handleLogout(event) {
    logout();
  }
  
  render() {
    return (
      <Navbar bg="primary" variant="dark" expand="lg">
        <Navbar.Brand as={Link} to="/">
          <img
            alt=""
            src={logo}
            width="70"
            height="70"
            className="d-inline-block align-center"
          />{" "}
          Academoo
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link as={Link} to="/moosfeed">
              Moosfeed
            </Nav.Link>
            <Nav.Link as={Link} to="/create-post">
              <PlusCircle className="mb-1" />
              <span> New Moo</span>
            </Nav.Link>
            <Nav.Link as={Link} to="/create-community">
              <PlusCircle className="mb-1" />
              <span> New Commoonity</span>
            </Nav.Link>
          </Nav>

          <Nav>
            <Dropdownbutton
              // as={Link}
              // to="/user-profile"
              variant="outline-light"
              title={
                <span>
                  <Image
                    className="mr-3"
                    src={defaultProfile}
                    roundedCircle
                    width="25"
                    height="25"
                  ></Image>
                  Yoo
                </span>
              }
              id="collasible-nav-dropdown"
              alignRight
              className="p0"
            >
              <NavDropdown.Item as={Link} to="/user-profile">
                <PersonCircle /> Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/user-settings">
                <Gear /> Settings
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={this.handleLogout}>
                <BoxArrowRight /> Log Out{" "}
              </NavDropdown.Item>
            </Dropdownbutton>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default HeaderBar;

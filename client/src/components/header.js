import React from 'react';
import Navbar from 'react-bootstrap/navbar';
import Nav from 'react-bootstrap/nav';
import NavDropdown from 'react-bootstrap/navdropdown';
import Dropdownbutton from 'react-bootstrap/DropdownButton';
import Button from 'react-bootstrap/button';
import Image from 'react-bootstrap/image';
import defaultProfile from '../images/default_profile.png'
import { PlusCircle, PersonCircle, Gear, BoxArrowRight } from 'react-bootstrap-icons';

class Header extends React.Component {
    render() {
        return (
            <Navbar bg="dark" variant="dark" expand="lg">
                <Navbar.Brand href="#home">Academoo</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#home">Hoome</Nav.Link>
                        <Nav.Link href="#link">
                            <PlusCircle className="mb-1" />
                            <span>  NewMoo</span>
                        </Nav.Link>
                    </Nav>

                    <Nav>
                        <Dropdownbutton variant="secondary" title={
                            <span><Image className="mr-3" src={defaultProfile} roundedCircle style={{maxWidth: "30px"}}></Image>Yoo</span>
                        } id="collasible-nav-dropdown" alignRight className="p0">
                            <NavDropdown.Item href="#action/3.1"><PersonCircle /> Profile</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2"><Gear /> Settings</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="#action/3.4"><BoxArrowRight /> Log Out </NavDropdown.Item>
                        </Dropdownbutton>
                    </Nav>

                </Navbar.Collapse>
            </Navbar>
        )
    }
}

export default Header;
import React from "react";
import Accordion from "react-bootstrap/Accordion";
import AccordionContext from "react-bootstrap/AccordionContext";
import Card from "react-bootstrap/Card";
import { useAccordionToggle } from "react-bootstrap/AccordionToggle";
import "bootstrap/dist/css/bootstrap.min.css";
import ListGroup from "react-bootstrap/ListGroup";
import {useContext} from "react";

import {
    CaretUpFill,
    CaretDownFill
  } from "react-bootstrap-icons";

function CommunityList({ children, eventKey, callback }) {
    return (
        <Accordion defaultActiveKey="0">
            <Card className="mt-4">
                <Accordion.Toggle as={Card.Header} eventKey="0" className="pt-4">
                    <h5>Hosted at www.bla.com
                    </h5>
                </Accordion.Toggle>

                <Accordion.Collapse eventKey="0">
                    <Card.Body className="px-0 py-1">
                        <ListGroup variant="flush">
                            <ListGroup.Item>Community 1</ListGroup.Item>
                            <ListGroup.Item>Community 2</ListGroup.Item>
                            <ListGroup.Item>Community 3</ListGroup.Item>
                        </ListGroup>
                    </Card.Body>
                </Accordion.Collapse>

            </Card>
        </Accordion>
    )
}

export default CommunityList;
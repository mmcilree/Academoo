import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Col, Form, FormControl, Button} from "react-bootstrap";
import { PlusCircle } from "react-bootstrap-icons";
function MiniPostCreator(props) {
    const [newPostText, setNewPostText] = useState("");

    return (
        <Form onSubmit={e => e.preventDefault()}>
            <Form.Row>
                <Form.Group as={Col} className="d-none d-sm-flex" sm={6} md={7} lg={9}>
                    <FormControl
                        type="text"
                        placeholder="Create your own post: "
                        name="newPostText"
                        className="mr-2"
                        onChange={e => setNewPostText(e.target.value)} />

                </Form.Group>
                <Form.Group as={Col} xs={12} sm={6} md={5} lg={3}>
                    <Link to={
                        {
                            pathname: "/create-post",
                            state: {
                                body: newPostText,
                                community: props.currentCommunity,
                                host: props.host
                            }
                        }
                    }>
                        <Button variant="outline-secondary" className="w-100" > <PlusCircle className="mb-1" /> New Moo</Button>
                    </Link>
                </Form.Group>
            </Form.Row>
        </Form>
    );
}

export default MiniPostCreator;
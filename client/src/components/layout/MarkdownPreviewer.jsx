import React from 'react';
import { Card, Form, Button, Modal, Table } from 'react-bootstrap';
import { QuestionCircle } from 'react-bootstrap-icons';

const ReactMarkdown = require('react-markdown');
const gfm = require('remark-gfm');
class MarkdownPreviewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
    }

    handleChange(event) {
        this.props.handleChange(event);
    }

    handleShow(event) {
        event.preventDefault();
        this.setState({
            show: true
        });
    }

    handleClose() {
        this.setState({
            show: false,
        });
    }

    render() {
        const body = this.props.body;
        const renderers = { heading: HeadingRenderer }
        const tableMarkdown = '| Syntax      | Description |\n| ----------- | ----------- |\n| Header      | Title       |\n'

        return (
            <React.Fragment>
                <br />
                <Form.Label className="d-flex justify-content-between">
                    Markdown Preview:
                    <Button xs={6} variant="link" onClick={this.handleShow}>Markdown Tips <QuestionCircle /></Button>
                </Form.Label>
                <Card >
                    <Card.Body style={{ height: "400px", "overflowY": "scroll" }}>
                        {/* <Card.Text> */}
                        <ReactMarkdown plugins={[gfm]} renderers={renderers} children={body} />
                        {/* </Card.Text> */}
                    </Card.Body>
                </Card>

                <Modal
                    size="lg"
                    show={this.state.show}
                    onHide={this.handleClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Markdown Tips</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Table bordered>
                            <thead>
                                <tr>
                                    <th>Type This!</th>
                                    <th>Display This!</th>
                                    <th>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <th className="font-weight-normal"># Heading1</th>
                                    <th className="font-weight-normal"><ReactMarkdown renderers={renderers}># Heading1</ReactMarkdown></th>
                                    <th className="font-weight-normal">Smaller headings: ##, ###, ####</th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal">**bold text**</th>
                                    <th className="font-weight-normal"><ReactMarkdown renderers={renderers}>**bold text**</ReactMarkdown></th>
                                    <th className="font-weight-normal">Alternative: __bold text__</th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal">*italics*</th>
                                    <th className="font-weight-normal"><ReactMarkdown renderers={renderers}>*italics*</ReactMarkdown></th>
                                    <th className="font-weight-normal">Alternative: _italics_</th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal">***really important***</th>
                                    <th className="font-weight-normal"><ReactMarkdown renderers={renderers}>***really important***</ReactMarkdown></th>
                                    <th className="font-weight-normal">Alternative: ___really important___</th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal"> * Option</th>
                                    <th className="font-weight-normal"><ReactMarkdown renderers={renderers}>* Option</ReactMarkdown></th>
                                    <th className="font-weight-normal">Alternative: - Option </th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal"> * [ ]  to-do </th>
                                    <th className="font-weight-normal"><ReactMarkdown plugins={[gfm]} renderers={renderers}>* [ ]  to-do </ReactMarkdown></th>
                                    <th className="font-weight-normal">Alternative: * [x]  to-do  <ReactMarkdown plugins={[gfm]} renderers={renderers}>* [x]  to-do </ReactMarkdown> </th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal"> `Code Block`</th>
                                    <th className="font-weight-normal"><ReactMarkdown renderers={renderers}>`Code Block`</ReactMarkdown></th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal">~strikethrough~</th>
                                    <th className="font-weight-normal"><ReactMarkdown plugins={[gfm]} renderers={renderers}>~strikethrough~</ReactMarkdown></th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal">{tableMarkdown}</th>
                                    <th className="font-weight-normal">
                                        <ReactMarkdown plugins={[gfm]} renderers={renderers} source={tableMarkdown} />
                                    </th>
                                </tr>
                                <tr>
                                    <th className="font-weight-normal">![Cow](https://cow.jpg)</th>
                                    <th className="font-weight-normal">[COW IMAGE!]</th>
                                </tr>
                            </tbody>
                        </Table>
                    </Modal.Body>
                </Modal>
            </React.Fragment >
        )
    }
}

export default MarkdownPreviewer;

const HeadingRenderer = (props) => {
    if (props.level === 1) {
        return <h3>{props.children}</h3>
    }
    if (props.level === 2) {
        return <h4>{props.children}</h4>
    }
    if (props.level === 3) {
        return <h5>{props.children}</h5>
    } else {
        return <h6>{props.children}</h6>
    }
}

import React from 'react';
import { Card, Form } from 'react-bootstrap';

const ReactMarkdown = require('react-markdown');
const gfm = require('remark-gfm');
class MarkdownPreviewer extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.handleChange(event);
    }
    render() {
        const body = this.props.body;
        const renderers = { heading: HeadingRenderer }
        return (
            <React.Fragment>
                <br />
                <Form.Label>Markdown Preview:</Form.Label>
                <Card >
                    <Card.Body style={{ height: "400px", "overflow-y": "scroll" }}>
                        <Card.Text>
                            <ReactMarkdown plugins={[gfm]} renderers={renderers} children={body} />
                        </Card.Text>
                    </Card.Body>
                </Card>
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

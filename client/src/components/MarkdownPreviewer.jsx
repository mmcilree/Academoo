import React from 'react';
import { Card } from 'react-bootstrap';

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
        return (
            <React.Fragment>
                <br />
                <Card >
                    <Card.Body>
                        <ReactMarkdown plugins={[gfm]} children={body} />
                    </Card.Body>
                </Card>
            </React.Fragment >
        )
    }
}

export default MarkdownPreviewer;

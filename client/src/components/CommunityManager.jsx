import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';

class CommunityManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = { id: "", title: "", description: "", administrators: "" };
    }

    handleChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({
            [name]: value
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    id: this.state.id,
                    title: this.state.title,
                    description: this.state.description,
                    admins: this.state.administrators,
                }
            )
        };

        fetch('/api/create-community', requestOptions);
        this.setState(
            { id: "", title: "", description: "", administrators: "" }
        );
    }

    render() {
        return (
            <Card className="mt-4">
                <Card.Header className="pt-4">
                    <Card.Title>Manage your community</Card.Title>
                </Card.Header>

                <Card.Body>
                    To be continued...
                </Card.Body>
            </Card>
        )
    }
}

export default CommunityManager;
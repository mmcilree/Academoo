import React from 'react';
import Button from 'react-bootstrap/Button';
import { BookmarkPlus, BookmarkCheck } from "react-bootstrap-icons";

import { authFetch } from '../../auth';

/**
 * component which renders the community subscribe button
 */
class CommunitySubscribeButton extends React.Component {
    state = {
        isSubscribed: false,
        isLoading: true
    }

    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.fetchUserDetails();
    }

    /**
     * fetch the details of the current user
     */
    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    isSubscribed: data.subscriptions.some(o => o.communityId === this.props.community),
                    isLoading: false
                })
            ).catch(() => { })
    }

    /**
     * method to connect with the backend to store what a user has subscribed to in the DB
     */
    async handleSubscribe() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                id: this.props.community,
                external: this.props.external
            }
        };

        requestOptions.body = JSON.stringify(requestOptions.body);

        await authFetch('/api/subscribe', requestOptions);
        this.props.updateParent && this.props.updateParent();
        this.fetchUserDetails();
    }

    /**
     * method to connect with the backend to store what a user has unsubscribed to in the DB
     */
    async handleUnsubscribe() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: {
                id: this.props.community,
                external: this.props.external
            }
        };

        requestOptions.body = JSON.stringify(requestOptions.body);

        await authFetch('/api/unsubscribe', requestOptions);
        this.props.updateParent && this.props.updateParent();
        this.fetchUserDetails();
    }

    /**
     * render the button to the page
     */
    render() {
        return !this.state.isLoading ? (this.state.isSubscribed ?
            <Button onClick={this.handleUnsubscribe.bind(this)} className="h-50" variant="outline-primary">
                <BookmarkCheck className="mr-2" />Unfolloow
            </Button> :
            <Button onClick={this.handleSubscribe.bind(this)} className="h-50" variant="outline-secondary">
                <BookmarkPlus className="mr-2" />&nbsp; Folloow &nbsp;
            </Button>) 
            : <Button variant="outline-secondary">&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp; ... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</Button>
    }
}

export default CommunitySubscribeButton;
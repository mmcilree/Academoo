import React from 'react';
import Button from 'react-bootstrap/Button';
import { BookmarkPlus, BookmarkCheck } from "react-bootstrap-icons";

import { authFetch } from '../auth';

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

    async fetchUserDetails() {
        await authFetch("/api/get-user").then(response => response.json())
            .then(data =>
                this.setState({
                    isSubscribed: data.subscriptions.includes(this.props.community),
                    isLoading: false
                })
            )
    }

    async handleSubscribe() {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: this.props.community
          }
        };
    
        requestOptions.body = JSON.stringify(requestOptions.body);
        
        await authFetch('/api/subscribe', requestOptions);
        this.props.updateParent && this.props.updateParent();
        this.fetchUserDetails();
    }

    async handleUnsubscribe() {
        const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: {
            id: this.props.community
          }
        };
    
        requestOptions.body = JSON.stringify(requestOptions.body);
        
        await authFetch('/api/unsubscribe', requestOptions);
        this.props.updateParent && this.props.updateParent();
        this.fetchUserDetails();
    }

    render() {
        return !this.state.isLoading && (this.state.isSubscribed ?
            <Button onClick={this.handleUnsubscribe.bind(this)} className="h-50 ml-4 mt-1" variant="outline-primary">
                <BookmarkCheck className="mr-2" />Unfolloow
            </Button> :
            <Button onClick={this.handleSubscribe.bind(this)} className="h-50 ml-4 mt-1" variant="outline-secondary">
                <BookmarkPlus className="mr-2" />&nbsp; Folloow &nbsp;
            </Button>)
    }
}

export default CommunitySubscribeButton;
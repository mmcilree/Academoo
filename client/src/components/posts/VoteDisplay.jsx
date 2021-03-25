import React from 'react';
import { ArrowUpSquare, ArrowUpSquareFill, ArrowDownSquare, ArrowDownSquareFill } from "react-bootstrap-icons";
import { Link } from 'react-router-dom';
import { authFetch } from '../../auth';

class VoteDisplay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            voteStatus: null,
            upvotes: this.props.upvotes,
            downvotes: this.props.downvotes,
            postId: this.props.postId,
            userID: null
        }
    }

    componentDidMount() {
        this.fetchVoteStatus();
    }


    fetchVoteStatus() {
        authFetch('/api/get-vote/' + this.state.postId)
          .then(response => {
            if (!response.ok || response.status != 200) {
              throw new Error();
            }
            return response.json()
          }
          ).then(data =>
            this.setState({ voteStatus: data.vote })
          ).catch((err) => {
          });
    }

    async voteOnPost(value) {
        if(this.state.voteStatus === "upvote") {
            if(value === "upvote") {
                this.setState({upvotes: this.state.upvotes - 1, voteStatus: "none"})
            } else {
                this.setState({upvotes: this.state.upvotes - 1, downvotes: this.state.downvotes + 1, voteStatus: "downvote"})
            }
        } else if(this.state.voteStatus === "downvote") {
            if(value === "upvote") {
                this.setState({upvotes: this.state.upvotes + 1, downvotes: this.state.downvotes - 1, voteStatus: "upvote"})
            } else {
                this.setState({downvotes: this.state.downvotes - 1, voteStatus: "none"})
            }
        } else {
            if(value === "upvote") {
                this.setState({upvotes: this.state.upvotes + 1, voteStatus: "upvote"})
            } else {
                this.setState({downvotes: this.state.downvotes + 1, voteStatus: "downvote"})
            }
        }

        await authFetch('/api/post-vote/' + this.state.postId + "?vote=" + value);
    }

    render() {
        return ( this.state.voteStatus &&
            <div>
                <Link className="text-muted ml-4"
                    to="#"
                    size="xs"
                    style={{ zIndex: 2, position: "relative", textAlign: "right" }}
                    onClick={() => this.voteOnPost("upvote")}>
                    <small>
                        {this.state.voteStatus === "upvote" ?
                            <strong><ArrowUpSquareFill className="mb-1 mr-1" /> Upmooed! ({this.state.upvotes})</strong> :
                            <span><ArrowUpSquare className="mb-1 mr-1" /> Upmoo ({this.state.upvotes}) &nbsp;&nbsp; &nbsp;&nbsp; </span>}
                    </small>
                </Link>

                <Link className="ml-4 text-muted"
                    to="#"
                    size="xs"
                    style={{ zIndex: 2, position: "relative" }}
                    onClick={() => this.voteOnPost("downvote")}>
                    <small>
                        {this.state.voteStatus === "downvote" ?
                            <strong><ArrowDownSquareFill className="mb-1 mr-1" /> Downmooed ({this.state.downvotes})</strong> :
                            <span><ArrowDownSquare className="mb-1 mr-1" /> Downmoo ({this.state.downvotes}) &nbsp;&nbsp;&nbsp; </span>}
                    </small>

                </Link>
            </div>

        )
    }

}

export default VoteDisplay
import React, { Component } from 'react';
import Poll from 'react-polls';
import Card from 'react-bootstrap/Card';
import { authFetch } from '../../auth';

const pollStyle = {
  theme: 'cyan'
}
class PollPost extends Component {
    // Setting answers to state to reload the component with each vote
    constructor(props) {
      super(props);
      const pollAnswers = this.props.pollData.possibleAnswers.map((item, idx) => ({
        "option": item.answer,
        "votes": this.props.pollData.results[idx].answers.length,
      }));

      this.state = {
        pollAnswers: [...pollAnswers],
        vote: null,
      };
    }

    fetchVote() {
      authFetch("/api/get-user").then(response => response.json())
          .then(data =>
              {
                const userVote = this.props.pollData.results.find(item => item.answers.includes(data.id));
                this.setState({
                  vote: userVote === undefined ? null : this.props.pollData.possibleAnswers[userVote["answerNumber"]]["answer"]
                })
              }
          ).catch(() => {})
    }

    componentDidMount() {
      this.fetchVote();
    }

    handleVote = voteAnswer => {
        const { pollAnswers } = this.state
        const newPollAnswers = pollAnswers.map(answer => {
          if (answer.option === voteAnswer) answer.votes++
          return answer
        })
        this.setState({
          pollAnswers: newPollAnswers
        })

        authFetch('/api/poll-vote/' + this.props.postID + "?vote=" + voteAnswer).then(r => r.status).then(statusCode => {
          if (statusCode != 200) {
            this.setState({ errors: ["Could not vote!"] })
          }
        }).catch(() => {});
    }

    render () {
        const { pollAnswers } = this.state
        return (
          <Card.Text variant="top" style={{
            whiteSpace: "nowrap",
            maxHeight: "50vh", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            <Poll customStyles={pollStyle} question="" vote={this.state.vote} noStorage answers={pollAnswers} onVote={this.handleVote} />
          </Card.Text>
        );
    }
}

export default PollPost;
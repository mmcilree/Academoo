import React, { Component } from 'react';
import Poll from 'react-polls';
import Card from 'react-bootstrap/Card';

// Get poll should return poll question and poll answers

// const pollQuestion = 'Is react-polls useful?'
// const pollAnswers = [
//   { option: 'Yes', votes: 8 },
//   { option: 'No', votes: 2 }
// ]

class PollPost extends Component {
    // Setting answers to state to reload the component with each vote
    constructor(props) {
      super(props);
      const pollAnswers = this.props.pollData.possibleAnswers[0].map((item, idx) => ({
        "option": item.answer,
        "votes": this.props.pollData.results[0][idx].answers.length,
      }));

      console.log(pollAnswers);
      console.log(this.props.pollData.results[0]);

      // const userVote = this.props.pollData.results.find(item => item.answer.includes(this.props.currentUser)).number;

      this.state = {
        pollAnswers: [...pollAnswers],
        // vote: this.props.pollData.pollAnswers[userVote],
      };
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

        // Should send POST request to vote
    }

    render () {
        const { pollAnswers } = this.state
        return (
          <Card.Text variant="top" style={{
            whiteSpace: "nowrap",
            maxHeight: "50vh", overflow: "hidden", textOverflow: "ellipsis"
          }}>
            <Poll question="" answers={pollAnswers} onVote={this.handleVote} />
          </Card.Text>
        );
    }
}

export default PollPost;
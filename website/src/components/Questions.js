import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import '../styles/Questions.css'
import { itemPropType } from '../lib/prop-types'
import { QuestionnaireItemSVGQuality7pt } from '../lib/thefragebogen'

const getAllQuestions = (questionType, { type, sentences }) => {
  if (questionType === 'general') {
    return [
      {
        key: 'readability',
        label: `How difficult was it for you to read this ${type}?`,
        answers: [
          { label: 'very difficult (1)', value: 1 },
          { label: 'difficult (2)', value: 2 },
          { label: 'slightly difficult (3)', value: 3 },
          { label: 'neutral (4)', value: 4 },
          { label: 'slightly easy (5)', value: 5 },
          { label: 'easy (6)', value: 6 },
          { label: 'very easy (7)', value: 7 },
        ],
      },
      {
        key: 'complexity',
        label: `How do you rate the overall complexity of this ${type}?`,
        answers: [
          { label: 'very complex (1)', value: 1 },
          { label: 'complex (2)', value: 2 },
          { label: 'slightly complex (3)', value: 3 },
          { label: 'neutral (4)', value: 4 },
          { label: 'slightly easy (5)', value: 5 },
          { label: 'easy (6)', value: 6 },
          { label: 'very easy (7)', value: 7 },
        ],
      },
      {
        key: 'understandability',
        label: `How well did you understand the ${type}?`,
        answers: [
          { label: "didn't understand at all (1)", value: 1 },
          { label: 'understood almost nothing (2)', value: 2 },
          { label: 'understood only a few things (3)', value: 3 },
          { label: 'understood some things (4)', value: 4 },
          { label: 'undestood it relatively well (5)', value: 5 },
          { label: 'understood most of it (6)', value: 6 },
          { label: 'fully understood (7)', value: 7 },
        ],
      },
    ]
  } else if (questionType === 'hardestSentence') {
    return [
      {
        key: 'hardestSentence',
        label: 'What was the hardest sentence in the paragraph?',
        answers: sentences.map((sentence, i) => {
          return {
            label: sentence,
            value: i + 1,
          }
        }),
      },
    ]
  }
}

class Questions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      questions: getAllQuestions(props.questionType, props.item),
      questionnaireItems: {},
    }
  }

  componentDidMount() {
    this.renderFragebogen()
  }

  renderFragebogen() {
    const questionnaireItems = {}
    this.state.questions.forEach(({ key, label, answers }) => {
      const uniqueKey = `${this.props.item._id}-${key}`

      const questionnaireItem = new QuestionnaireItemSVGQuality7pt(
        '',
        `<strong>${label}</strong>`,
        false,
        answers.map(answer => answer.label)
      )

      questionnaireItems[uniqueKey] = questionnaireItem

      const parent = document.getElementById(uniqueKey)
      if (parent && parent.childElementCount === 0) {
        parent.appendChild(questionnaireItem.createUI())
      }
    })
    this.setState({
      questionnaireItems: {
        ...questionnaireItems,
      },
    })
  }

  getAnswer(key) {
    const questionnaireItem = this.state.questionnaireItems[key]
    if (questionnaireItem) {
      return questionnaireItem.getAnswer()
    }
  }

  render() {
    return (
      <Fragment>
        <div>
          <strong>
            Please answer{' '}
            {this.state.questions.length > 1
              ? 'these questions'
              : 'this question'}{' '}
            about the {this.props.item.type} you just read:
          </strong>
          <div className="note">
            (You can choose your answer by clicking anywhere on the scale)
          </div>
        </div>

        {this.state.questions.map(({ key }) => {
          const uniqueKey = `${this.props.item._id}-${key}`
          return (
            <div
              key={uniqueKey}
              id={uniqueKey}
              className="question-box"
              onClick={() => {
                this.props.onChange(key, this.getAnswer(uniqueKey))
              }}
            />
          )
        })}
      </Fragment>
    )
  }
}

Questions.propTypes = {
  questionType: PropTypes.string,
  item: itemPropType,
  onChange: PropTypes.func,
  answers: PropTypes.object,
}

export default Questions

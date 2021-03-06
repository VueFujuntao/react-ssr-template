import React from 'react';
import Helmet from 'react-helmet';
// import injectSheet from 'react-jss';
import  './index.css';
import { connect } from 'react-redux';
import { setSourceDataInput } from '../../redux/module/dataSource'

// console.log(styles)
// const styles = {
//   myButton: {
//     color: 'green',
//     margin: { // jss-expand gives more readable syntax
//       top: 5, // jss-default-unit makes this 5px
//       right: 0,
//       bottom: 0,
//       left: '1rem'
//     },
//     '& span': { // jss-nested applies this to a child span
//       fontWeight: 'bold' // jss-camel-case turns this into 'font-weight'
//     }
//   },
//   myLabel: {
//     fontStyle: 'italic'
//   }
// }
// @injectSheet(styles)
@connect(
  state => state.dataSource,
  {setSourceDataInput}
)
 class TopicList extends React.Component {
  constructor(props) {
    super(props)
  }
  asyncBootstrap() {
    return new Promise((resolve) => {
      setTimeout(() => {
       console.log(12222)
      })
    })
  }
  // static fetch() {

  // }
  componentWillMount() {
    this.props.setSourceDataInput(20)
  }
  componentDidMount() {
    console.log(1)

  }
  render() {
    const {classes} = this.props;
    return (
      <div>
        <Helmet>
          <title>this is topic list</title>
          <meta name="description" content="this is topic lists"></meta>
        </Helmet>
        <h1 className='title'>TopicList</h1>
      </div>
    )
  }
}

export default TopicList;

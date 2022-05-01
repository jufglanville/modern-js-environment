/* eslint-disable react/prefer-stateless-function */
import ReactDOM from 'react-dom';
import React from 'react';

class App extends React.Component {
  render() {
    return (
      <div>
        <h3>Hello There! What is your name?</h3>
        <input />
        <button type="button" onClick={() => alert('Hello')}>
          Say Hello
        </button>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));

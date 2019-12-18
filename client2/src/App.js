import React from 'react';

import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import OtherPage from './OtherPage'
import Fib from './Fib'

function App() {
  return (
    <Router>
      <header className="App-header">
        <Link to="/">Home</Link>
        <Link to="/otherpage">Otherpage</Link>
      </header>
      <Switch>
        <Route exact path="/" component={Fib} />
        <Route path="/otherpage" component={OtherPage} />
      </Switch>
    </Router>
  );
}

export default App;

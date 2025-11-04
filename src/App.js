import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ScrollToTop from './component/Common/ScrollToTop';
import Login from './page/login';
import Register from './page/register';
import Homepage from './page/homepage';

const App = () => {
  return (
    <>
      <Helmet>
        <title>CS308 - Authentication</title>
        <meta name="description" content="CS308 - Login and Register Authentication System" />
      </Helmet>
      <Router>
        <ScrollToTop>
          <Switch>
            <Route path='/' exact component={Login} />
            <Route path='/login' exact component={Login} />
            <Route path='/register' exact component={Register} />
            <Route path='/homepage' exact component={Homepage} />
            <Route component={Login} />
          </Switch>
        </ScrollToTop>
      </Router>
    </>
  );
}

export default App;


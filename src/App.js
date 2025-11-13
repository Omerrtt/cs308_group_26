import React, { useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import ScrollToTop from './component/Common/ScrollToTop';
import Login from './page/login';
import Register from './page/register';
import Homepage from './page/homepage';
import Profile from './page/profile';

const App = () => {
  useEffect(() => {
    // Sayfa yükleme performansını ölç
    if (window.performance && window.performance.timing) {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      console.log(`[PERFORMANCE] Page Load Time: ${pageLoadTime}ms`);
      console.log(`[PERFORMANCE] DOM Ready Time: ${domReadyTime}ms`);
    }
    
    // Resource timing
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      const cssFiles = resources.filter(r => r.name.includes('.css'));
      const jsFiles = resources.filter(r => r.name.includes('.js'));
      
      console.log(`[PERFORMANCE] Total Resources: ${resources.length}`);
      console.log(`[PERFORMANCE] CSS Files: ${cssFiles.length}, Total Size: ${cssFiles.reduce((sum, r) => sum + (r.transferSize || 0), 0)} bytes`);
      console.log(`[PERFORMANCE] JS Files: ${jsFiles.length}, Total Size: ${jsFiles.reduce((sum, r) => sum + (r.transferSize || 0), 0)} bytes`);
    }
  }, []);

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
            <Route path='/profile' exact component={Profile} />
            <Route component={Login} />
          </Switch>
        </ScrollToTop>
      </Router>
    </>
  );
}

export default App;


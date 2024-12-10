import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { Home } from './src/pages/Home';
import { initTelemetry } from './src/telemetry/otelConfig';

const App = () => {
  useEffect(() => {
    initTelemetry(); // Initialize telemetry
  }, []);
  
  return (
    <>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <Home />
    </>
  );
}

export default App;
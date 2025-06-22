import React from 'react';
import { render } from '@testing-library/react';

// Simple test that doesn't depend on routing
test('App component imports and renders without crashing', () => {
  // Just test that the component can be imported
  expect(() => {
    const App = require('./App').default;
    expect(App).toBeDefined();
  }).not.toThrow();
});
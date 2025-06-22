import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('./components/PlacesPage', () => {
  return function MockPlacesPage() {
    return <div data-testid="places-page">Places Page</div>;
  };
});

jest.mock('./components/CreatePage', () => {
  return function MockCreatePage() {
    return <div data-testid="create-page">Create Page</div>;
  };
});

import App from './App';

test('renders app without crashing', () => {
  render(<App />);
  expect(screen.getByTestId('places-page')).toBeInTheDocument();
});
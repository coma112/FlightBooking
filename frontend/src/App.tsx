import { useState } from 'react';
import HomePage from './pages/HomePage';
import FlightListPage from './pages/FlightListPage';
import './App.css';

type Page = 'home' | 'flights';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (currentPage === 'flights') {
    return <FlightListPage />;
  }

  return <HomePage onSearch={() => navigateTo('flights')} />;
}

export default App;
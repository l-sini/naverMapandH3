import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const { VITE_QUERY_STALE_TIME } = import.meta.env;

const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Number(VITE_QUERY_STALE_TIME),
      retryDelay: 30000,
      suspense: true,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <QueryClientProvider client={reactQueryClient}>
        <App />
      </QueryClientProvider>
    </Router>
  </React.StrictMode>
);

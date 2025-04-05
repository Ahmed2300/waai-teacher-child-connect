
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './lib/firebase'; // Import Firebase initialization

// Set the document direction to RTL for Arabic
document.documentElement.dir = 'rtl';

createRoot(document.getElementById("root")!).render(<App />);

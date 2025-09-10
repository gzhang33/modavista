```jsx
import React from 'react';
import Header from './components/Header';
import CoursesPage from './components/CoursesPage';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Header />
      <main>
        <CoursesPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
```
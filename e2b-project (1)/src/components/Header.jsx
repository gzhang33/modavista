```jsx
import React, { useState } from 'react';

const ShiftaLogo = () => (
    <svg width="120" height="30" viewBox="0 0 133 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.5593 0.93222H21.2373L13.1525 15.3559L21.2373 32.1356H11.5593L7.20339 21.8983H7.01695V32.1356H0.644043V0.93222H7.01695V11.4576H7.20339L11.5593 0.93222Z" fill="black"/>
        <path d="M36.1695 0.93222V32.1356H29.7966V0.93222H36.1695Z" fill="black"/>
        <path d="M54.2034 0.93222H60.5763V26.4237L60.7627 32.1356H54.0169L53.8305 26.4237V0.93222H54.2034Z" fill="black"/>
        <path d="M72.339 12.3898L75.1186 0.93222H81.8644L76.2203 19.4407V32.1356H69.8475V19.4407L64.2034 0.93222H70.9492L72.339 12.3898Z" fill="black"/>
        <path d="M100.847 0.93222H107.22V32.1356H100.847V0.93222Z" fill="black"/>
        <path d="M123.61 16.4746C123.61 25.322 118.593 33.0678 109.085 33.0678C99.5763 33.0678 94.5593 25.322 94.5593 16.4746C94.5593 7.62713 99.5763 0 109.085 0C118.593 0 123.61 7.62713 123.61 16.4746ZM101.22 16.4746C101.22 21.6102 103.458 26.8475 109.085 26.8475C114.712 26.8475 116.949 21.6102 116.949 16.4746C116.949 11.339 114.712 6.10171 109.085 6.10171C103.458 6.10171 101.22 11.339 101.22 16.4746Z" fill="black"/>
        <path d="M132.051 0.93222H132.237L128.814 13.5085L132.237 32.1356H126.051L124.458 22.2712H124.271V32.1356H123.61V0.93222H124.271V11.0848H124.458L126.051 0.93222H132.051Z" fill="black"/>
    </svg>
);


export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = ["Formaciones", "Admisiones", "Metodología", "Comunidad", "Blog"];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <a href="#" aria-label="Home">
              <ShiftaLogo />
            </a>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a key={link} href="#" className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200">
                {link}
              </a>
            ))}
            <a href="#" className="text-sm font-medium text-white bg-black px-4 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Contacto
            </a>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black">
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <a key={link} href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50">
                {link}
              </a>
            ))}
             <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50">
              Contacto
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
```
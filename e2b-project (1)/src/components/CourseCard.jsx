```jsx
import React from 'react';

export default function CourseCard({ type, title, startDate, imageUrl, link }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-2 transition-all duration-300 ease-in-out hover:shadow-xl group">
      <a href={link} target="_blank" rel="noopener noreferrer">
        <div className="relative">
          <img className="w-full h-48 object-cover" src={imageUrl} alt={title} />
          <div className="absolute top-0 left-0 bg-black bg-opacity-50 text-white px-3 py-1 text-sm font-semibold m-2 rounded-full group-hover:bg-opacity-75 transition-opacity">
            {type}
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2 h-14 overflow-hidden">{title}</h3>
          <p className="text-gray-600 text-sm mb-4">{startDate}</p>
          <div className="flex items-center text-black font-semibold group-hover:text-blue-600 transition-colors">
            <span>Saber más</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
```
```jsx
import React, { useState } from 'react';

const FilterSection = ({ title, options }) => {
  const [selected, setSelected] = useState([]);

  const toggleSelection = (option) => {
    setSelected(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 border-b pb-2">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => toggleSelection(option)}
            className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 \${
              selected.includes(option)
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function FilterSidebar() {
  const disciplines = ["Branding", "Espacios", "Estrategia", "Gráfico", "Inteligencia Artificial", "Media", "Producto Digital", "Web"];
  const typologies = ["Cápsula", "Curso", "Máster", "Posgrado"];
  const languages = ["Español", "Inglés"];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm sticky top-24">
      <h2 className="text-2xl font-bold mb-6">Filtro</h2>
      <FilterSection title="Disciplina" options={disciplines} />
      <FilterSection title="Tipología" options={typologies} />
      <FilterSection title="Idioma" options={languages} />
      <button className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-800 transition-all duration-300 transform hover:scale-105 shadow-md">
        Aplicar
      </button>
    </div>
  );
}
```
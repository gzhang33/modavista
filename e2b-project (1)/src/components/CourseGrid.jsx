```jsx
import React from 'react';
import CourseCard from './CourseCard';

const courses = [
  {
    type: 'Máster',
    title: 'Máster en Diseño Estratégico e Innovación',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/diseno_estrategico_1-1_cmp.jpg',
    link: 'https://weareshifta.com/formaciones/master-diseno-estrategico/'
  },
  {
    type: 'Máster',
    title: 'Máster en Inteligencia Artificial Generativa para creativos',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Master-IA-Generativa.jpg',
    link: 'https://weareshifta.com/formaciones/master-en-ia-generativa-para-creativos/'
  },
  {
    type: 'Curso',
    title: 'Branding con Inteligencia Artificial',
    startDate: 'Inicio: 13 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Curso-Branding-con-IA.jpg',
    link: 'https://weareshifta.com/formaciones/curso-en-branding-con-ia/'
  },
  {
    type: 'Máster',
    title: 'Máster en Diseño Gráfico',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/grafico_destacada_cmp.jpg',
    link: 'https://weareshifta.com/formaciones/master-online-diseno-grafico/'
  },
  {
    type: 'Posgrado',
    title: 'Posgrado en Creatividad Publicitaria',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Creatividad-Publicitaria.jpg',
    link: 'https://weareshifta.com/formaciones/posgrado-en-creatividad-publicitaria/'
  },
  {
    type: 'Máster',
    title: 'Máster en Gestión y Marketing de Producto Digital',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Master-Gestion-y-Marketing-de-Producto-Digital.jpg',
    link: 'https://weareshifta.com/formaciones/master-gestion-y-marketing-producto-digital/'
  },
  {
    type: 'Curso',
    title: 'Relación con Prensa y Medios de Comunicación',
    startDate: 'Inicio: 13 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Curso-Relacion-con-Prensa.jpg',
    link: 'https://weareshifta.com/formaciones/curso-en-relacion-prensa/'
  },
  {
    type: 'Posgrado',
    title: 'Posgrado en Desarrollo Front End para Diseñadores',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Front-End.jpg',
    link: 'https://weareshifta.com/formaciones/posgrado-en-frontend-para-disenadores/'
  },
  {
    type: 'Curso',
    title: 'Visual Merchandising',
    startDate: 'Inicio: 13 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/Visual-Merchandising.jpg',
    link: 'https://weareshifta.com/formaciones/curso-en-visual-merchandising/'
  },
   {
    type: 'Máster',
    title: 'Máster en Diseño de Interiores',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/interiores_destacada_cmp.jpg',
    link: 'https://weareshifta.com/formaciones/master-online-diseno-de-interiores/'
  },
  {
    type: 'Posgrado',
    title: 'Posgrado en Service Design',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/2023/06/Posgrado_Service_Design_1-1.jpg',
    link: 'https://weareshifta.com/formaciones/posgrado-service-design-y-design-thinking/'
  },
   {
    type: 'Máster',
    title: 'Máster en UX, UI: Diseño Web y Producto Digital',
    startDate: 'Inicio: 20 de octubre 2025.',
    imageUrl: 'https://weareshifta.com/wp-content/uploads/ux_destacada_cmp.jpg',
    link: 'https://weareshifta.com/formaciones/master-ux-ui/'
  },
];

export default function CourseGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses.map((course, index) => (
        <CourseCard key={index} {...course} />
      ))}
    </div>
  );
}
```
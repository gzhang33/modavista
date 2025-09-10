```jsx
import React from 'react';
import FilterSidebar from './FilterSidebar';
import CourseGrid from './CourseGrid';

export default function CoursesPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Elige tu formación</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        <aside className="w-full md:w-1/4 lg:w-1/5">
          <FilterSidebar />
        </aside>
        <section className="w-full md:w-3/4 lg:w-4/5">
          <CourseGrid />
        </section>
      </div>
    </div>
  );
}
```
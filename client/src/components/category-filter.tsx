import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterState, CATEGORIES, FABRICS, SEASONS, STYLES } from "@/types";

interface CategoryFilterProps {
  filters: FilterState;
  onUpdateFilters: (filters: Partial<FilterState>) => void;
}

export default function CategoryFilter({ filters, onUpdateFilters }: CategoryFilterProps) {
  const handleCategoryChange = (category: string) => {
    onUpdateFilters({ category });
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onUpdateFilters({ [key]: value });
  };

  const applyFilters = () => {
    // Filters are applied in real-time, this button could trigger additional actions
    console.log('Applying filters:', filters);
  };

  return (
    <section className="bg-soft-white py-8" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h3 className="text-2xl font-playfair font-semibold text-charcoal mb-2">
              Browse by Category
            </h3>
            <p className="text-text-grey">Filter our extensive collection by garment type and style</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                variant={filters.category === category.id ? "default" : "outline"}
                className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-300 ${
                  filters.category === category.id
                    ? 'border-charcoal bg-charcoal text-white'
                    : 'border-gray-300 text-text-grey hover:border-charcoal hover:text-charcoal'
                }`}
                data-testid={`filter-category-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={filters.fabric} onValueChange={(value) => handleFilterChange('fabric', value)}>
            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent" data-testid="select-fabric">
              <SelectValue placeholder="All Fabrics" />
            </SelectTrigger>
            <SelectContent>
              {FABRICS.map((fabric) => (
                <SelectItem key={fabric.id} value={fabric.id}>
                  {fabric.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.season} onValueChange={(value) => handleFilterChange('season', value)}>
            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent" data-testid="select-season">
              <SelectValue placeholder="All Seasons" />
            </SelectTrigger>
            <SelectContent>
              {SEASONS.map((season) => (
                <SelectItem key={season.id} value={season.id}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.style} onValueChange={(value) => handleFilterChange('style', value)}>
            <SelectTrigger className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent" data-testid="select-style">
              <SelectValue placeholder="All Styles" />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={applyFilters}
            className="bg-charcoal text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-300 font-medium"
            data-testid="button-apply-filters"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </section>
  );
}

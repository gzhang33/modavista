// 动态筛选项数据获取工具
// 从数据库API获取最新的分类、材质、颜色等筛选选项

export interface FilterOption {
  id: string;
  name: string;
  label: string;
}

export interface FilterOptionsData {
  categories: FilterOption[];
  materials: FilterOption[];
  colors: FilterOption[];
  seasons: FilterOption[];
  styles: FilterOption[];
}

// 从分类API获取分类列表
export async function fetchCategories(languageCode: string = 'en'): Promise<FilterOption[]> {
  try {
    // 前端网站使用英文
    const response = await fetch(`/api/categories.php?lang=${languageCode}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const categories = await response.json();
    console.log('Fetched categories:', categories);
    
    // 转换为筛选选项格式
    const options: FilterOption[] = [
      { id: 'all', name: 'All Categories', label: 'All Categories' }
    ];
    
    if (Array.isArray(categories)) {
      categories.forEach(category => {
        const name = typeof category === 'string' ? category : category.name || category;
        if (name && name !== 'all') {
          options.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            label: name
          });
        }
      });
    }
    
    return options;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    // 返回默认选项
    return [
      { id: 'all', name: 'All Categories', label: 'All Categories' },
      { id: 'shirts', name: 'Shirts', label: 'Shirts' },
      { id: 'dresses', name: 'Dresses', label: 'Dresses' },
      { id: 'pants', name: 'Pants', label: 'Pants' }
    ];
  }
}

// 从材质API获取材质列表
export async function fetchMaterials(languageCode: string = 'en'): Promise<FilterOption[]> {
  try {
    // 前端网站使用英文
    const response = await fetch(`/api/materials.php?lang=${languageCode}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const materials = await response.json();
    console.log('Fetched materials:', materials);
    
    // 转换为筛选选项格式
    const options: FilterOption[] = [
      { id: 'all', name: 'All Materials', label: 'All Materials' }
    ];
    
    if (Array.isArray(materials)) {
      materials.forEach(material => {
        const name = material.name || material.material_name || material;
        if (name && name !== 'all') {
          options.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            label: name
          });
        }
      });
    }
    
    return options;
  } catch (error) {
    console.error('Failed to fetch materials:', error);
    // 返回默认选项
    return [
      { id: 'all', name: 'All Materials', label: 'All Materials' },
      { id: 'cotton', name: 'Cotton', label: 'Cotton' },
      { id: 'silk', name: 'Silk', label: 'Silk' },
      { id: 'wool', name: 'Wool', label: 'Wool' }
    ];
  }
}

// 从颜色API获取颜色列表
export async function fetchColors(languageCode: string = 'en'): Promise<FilterOption[]> {
  try {
    // 前端网站使用英文
    const response = await fetch(`/api/colors.php?lang=${languageCode}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const colors = await response.json();
    console.log('Fetched colors:', colors);
    
    // 转换为筛选选项格式
    const options: FilterOption[] = [
      { id: 'all', name: 'All Colors', label: 'All Colors' }
    ];
    
    if (Array.isArray(colors)) {
      colors.forEach(color => {
        const name = color.name || color.color_name || color;
        if (name && name !== 'all') {
          options.push({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            label: name
          });
        }
      });
    }
    
    return options;
  } catch (error) {
    console.error('Failed to fetch colors:', error);
    // 返回默认选项
    return [
      { id: 'all', name: 'All Colors', label: 'All Colors' },
      { id: 'red', name: 'Red', label: 'Red' },
      { id: 'blue', name: 'Blue', label: 'Blue' },
      { id: 'green', name: 'Green', label: 'Green' }
    ];
  }
}

export async function fetchSeasons(languageCode: string = 'en'): Promise<FilterOption[]> {
  try {
    const response = await fetch(`/api/seasons.php?lang=${languageCode}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const seasons = await response.json();
    console.log('Fetched seasons:', seasons);
    
    const options: FilterOption[] = [
      { id: 'all', name: 'All Seasons', label: 'All Seasons' }
    ];
    
    if (Array.isArray(seasons)) {
      seasons.forEach(season => {
        if (season.name && season.id) {
          options.push({
            id: String(season.id),
            name: season.name,
            label: season.name
          });
        }
      });
    }
    
    return options;
  } catch (error) {
    console.error('Failed to fetch seasons:', error);
    return [
      { id: 'all', name: 'All Seasons', label: 'All Seasons' },
      { id: '1', name: 'Spring/Summer', label: 'Spring/Summer' },
      { id: '2', name: 'Fall/Winter', label: 'Fall/Winter' },
      { id: '3', name: 'All Season', label: 'All Season' },
    ];
  }
}

// 获取所有筛选选项
export async function fetchAllFilterOptions(languageCode: string = 'en'): Promise<FilterOptionsData> {
  const [categories, materials, colors, seasons] = await Promise.all([
    fetchCategories(languageCode),
    fetchMaterials(languageCode),
    fetchColors(languageCode),
    fetchSeasons(languageCode)
  ]);
  
  return {
    categories,
    materials,
    colors,
    seasons
  };
}
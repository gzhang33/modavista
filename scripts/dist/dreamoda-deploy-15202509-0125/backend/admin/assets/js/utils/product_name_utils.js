// admin/assets/js/utils/product_name_utils.js
// Utility functions for product name processing

/**
 * Extract base name from product name
 * @param {string} name - Full product name
 * @returns {string} Base name
 */
export function get_base_name(name) {
    if (!name) return '';

    // Remove color information from name (assuming format: "Base Name - Color")
    const parts = name.split(' - ');
    return parts[0] || name;
}

/**
 * Extract color label from product name
 * @param {string} name - Full product name
 * @returns {string|null} Color label or null
 */
export function extract_color_label(name) {
    if (!name) return null;

    // Extract color information from name (assuming format: "Base Name - Color")
    const parts = name.split(' - ');
    if (parts.length > 1) {
        return parts[parts.length - 1];
    }

    return null;
}

/**
 * Convert color name to hex color
 * @param {string} color_name - Color name
 * @returns {string} Hex color code or default
 */
export function color_name_to_hex(color_name) {
    if (!color_name) return '#000000';

    const colorMap = {
        'red': '#FF0000',
        'blue': '#0000FF',
        'green': '#00FF00',
        'black': '#000000',
        'white': '#FFFFFF',
        'gray': '#808080',
        'grey': '#808080',
        'yellow': '#FFFF00',
        'purple': '#800080',
        'pink': '#FFC0CB',
        'orange': '#FFA500',
        'brown': '#A52A2A',
        'navy': '#000080',
        'maroon': '#800000',
        'lime': '#00FF00',
        'aqua': '#00FFFF',
        'teal': '#008080',
        'olive': '#808000',
        'silver': '#C0C0C0'
    };

    const normalizedColor = color_name.toLowerCase().trim();
    return colorMap[normalizedColor] || '#000000';
}

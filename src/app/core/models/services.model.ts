export interface ServiceCategory {
  category_id: number;
  category_name: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  subcategory_id: number;
  subcategory_name: string;
  description: string;
  price_from: number;
  price_to: number;
}

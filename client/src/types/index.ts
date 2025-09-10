export interface NavItem {
  title: string;
  href?: string;
  description?: string;
}

export interface NavItemWithChildren extends NavItem {
  card?: NavItemWithChildren[];
  menu?: NavItemWithChildren[];
}

export type MainNavItem = NavItemWithChildren;

export type Image = {
  id: number;
  path: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  images: string[];
  categoryId: string;
  price: number;
  discount: number;
  rating: number;
  inventory: number;
  status: string;
};

export type Tag = {
  name: string;
};

export type Post = {
  id: number;
  author: {
    fullName: string;
  };
  title: string;
  content: string;
  image: string;
  body: string;
  updatedAt: string;
  tags: Tag[];
};

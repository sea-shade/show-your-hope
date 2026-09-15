export interface Country {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface City {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
}

export interface Artist {
  id: number;
  fullname: string;
  gender: 'male' | 'female';
  country: Country;
  city: City | null;
}

export interface Video {
  link: string;
}

export interface Painting {
  id: number;
  tag: string;
  title: string;
  date: string;
  is_vertical: boolean;
  sell_status: string;
  story: string;
  is_private: boolean;
  artist: Artist;
  characteristics: string[];
  selections: string[];
  videos: Video[];
}

export interface Exhibition {
  id: number;
  name: string;
  category: string;
  start_date: string;
  end_date: string;
  country: string;
  city: string;
  latitude: number;
  longitude: number;
}

export interface Characteristic {
  id: number;
  name: string;
}

export interface Selection {
  id: number;
  name: string;
}

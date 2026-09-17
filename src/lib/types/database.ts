export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  role: "user" | "admin";
  created_at: string;
};

export type Spot = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  water_body_name: string;
  is_mapped_river: boolean;
  access_notes: string | null;
  created_at: string;
};

export type SpotPhoto = {
  id: string;
  spot_id: string;
  photo_url: string;
  uploaded_by: string;
  created_at: string;
};

export type FishSpecies = {
  id: number;
  name: string;
  scientific_name: string | null;
};

export type Catch = {
  id: string;
  user_id: string;
  spot_id: string | null;
  species_id: number;
  weight_kg: number | null;
  length_cm: number | null;
  caught_at: string;
  notes: string | null;
  created_at: string;
};

export type CatchPhoto = {
  id: string;
  catch_id: string;
  photo_url: string;
};

export type TemperatureReading = {
  id: string;
  user_id: string;
  spot_id: string | null;
  water_body_name: string;
  temperature_celsius: number;
  recorded_at: string;
  latitude: number | null;
  longitude: number | null;
};

export type BlogPost = {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  content: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export type ForumThread = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  created_at: string;
  pinned: boolean;
};

export type ForumPost = {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      spots: {
        Row: Spot;
        Insert: Partial<Spot> & { name: string; latitude: number; longitude: number; water_body_name: string };
        Update: Partial<Spot>;
        Relationships: [
          {
            foreignKeyName: "spots_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      spot_photos: {
        Row: SpotPhoto;
        Insert: Partial<SpotPhoto> & { spot_id: string; photo_url: string; uploaded_by: string };
        Update: Partial<SpotPhoto>;
        Relationships: [
          {
            foreignKeyName: "spot_photos_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "spot_photos_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      fish_species: {
        Row: FishSpecies;
        Insert: Partial<FishSpecies> & { name: string };
        Update: Partial<FishSpecies>;
        Relationships: [];
      };
      catches: {
        Row: Catch;
        Insert: Partial<Catch> & { species_id: number; caught_at: string };
        Update: Partial<Catch>;
        Relationships: [
          {
            foreignKeyName: "catches_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "catches_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "catches_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "fish_species";
            referencedColumns: ["id"];
          },
        ];
      };
      catch_photos: {
        Row: CatchPhoto;
        Insert: Partial<CatchPhoto> & { catch_id: string; photo_url: string };
        Update: Partial<CatchPhoto>;
        Relationships: [
          {
            foreignKeyName: "catch_photos_catch_id_fkey";
            columns: ["catch_id"];
            isOneToOne: false;
            referencedRelation: "catches";
            referencedColumns: ["id"];
          },
        ];
      };
      temperature_readings: {
        Row: TemperatureReading;
        Insert: Partial<TemperatureReading> & { water_body_name: string; temperature_celsius: number };
        Update: Partial<TemperatureReading>;
        Relationships: [
          {
            foreignKeyName: "temperature_readings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "temperature_readings_spot_id_fkey";
            columns: ["spot_id"];
            isOneToOne: false;
            referencedRelation: "spots";
            referencedColumns: ["id"];
          },
        ];
      };
      blog_posts: {
        Row: BlogPost;
        Insert: Partial<BlogPost> & { title: string; slug: string; content: string };
        Update: Partial<BlogPost>;
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_threads: {
        Row: ForumThread;
        Insert: Partial<ForumThread> & { category: string; title: string };
        Update: Partial<ForumThread>;
        Relationships: [
          {
            foreignKeyName: "forum_threads_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      forum_posts: {
        Row: ForumPost;
        Insert: Partial<ForumPost> & { thread_id: string; content: string };
        Update: Partial<ForumPost>;
        Relationships: [
          {
            foreignKeyName: "forum_posts_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "forum_threads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "forum_posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

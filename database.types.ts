export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          creator_id: string;
          title: string;
          description: string | null;
          price: number;
          category: string | null;
          metadata: Json | null;
          options: Json | null;
          preview_url: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          creator_id: string;
          title: string;
          description?: string | null;
          price: number;
          category?: string | null;
          metadata?: Json | null;
          options?: Json | null;
          preview_url?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          creator_id?: string;
          title?: string;
          description?: string | null;
          price?: number;
          category?: string | null;
          metadata?: Json | null;
          options?: Json | null;
          preview_url?: string | null;
          status?: string | null;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "listings_creator_id_fkey";
            columns: ["creator_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          listing_id: string;
          amount: number;
          status: "pending" | "paid" | "delivered" | "completed" | "disputed";
          escrow_status: "held" | "released" | "refunded";
          created_at: string | null;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          listing_id: string;
          amount: number;
          status?: "pending" | "paid" | "delivered" | "completed" | "disputed";
          escrow_status?: "held" | "released" | "refunded";
          created_at?: string | null;
        };
        Update: {
          id?: string;
          buyer_id?: string;
          listing_id?: string;
          amount?: number;
          status?: "pending" | "paid" | "delivered" | "completed" | "disputed";
          escrow_status?: "held" | "released" | "refunded";
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: "buyer" | "creator" | "admin" | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "buyer" | "creator" | "admin" | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "buyer" | "creator" | "admin" | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

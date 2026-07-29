// Hand-written to match supabase/migrations/*.sql until the real project
// exists and these can be regenerated with:
//   npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type UserRole = "admin" | "office" | "technician";
export type AssetStatus = "active" | "in_repair" | "disposed";
export type MaintenanceType = "repair" | "inspection" | "service" | "other";
export type MaintenanceStatus = "open" | "in_progress" | "resolved";
export type DisposalType = "sold" | "scrapped" | "written_off" | "lost";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: UserRole;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      category: {
        Row: { id: string; name: string };
        Insert: Partial<Database["public"]["Tables"]["category"]["Row"]> & { name: string };
        Update: Partial<Database["public"]["Tables"]["category"]["Row"]>;
      };
      location: {
        Row: {
          id: string;
          site: string;
          building: string | null;
          floor: string | null;
          room: string | null;
          parent_location_id: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["location"]["Row"]> & { site: string };
        Update: Partial<Database["public"]["Tables"]["location"]["Row"]>;
      };
      cost_centre: {
        Row: {
          id: string;
          code: string;
          name: string;
          owner: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["cost_centre"]["Row"]> & {
          code: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["cost_centre"]["Row"]>;
      };
      asset: {
        Row: {
          id: string;
          asset_tag: string;
          name: string;
          description: string | null;
          category_id: string | null;
          location_id: string | null;
          cost_centre_id: string | null;
          status: AssetStatus;
          serial_number: string | null;
          manufacturer: string | null;
          model: string | null;
          purchase_date: string | null;
          purchase_cost: number | null;
          useful_life_years: number | null;
          salvage_value: number;
          warranty_expiry: string | null;
          insured_value: number | null;
          photo_url: string | null;
          qr_token: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["asset"]["Row"]> & {
          asset_tag: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["asset"]["Row"]>;
      };
      maintenance_log: {
        Row: {
          id: string;
          asset_id: string;
          technician_id: string;
          type: MaintenanceType;
          description: string;
          status: MaintenanceStatus;
          photo_urls: string[];
          parts_cost: number | null;
          logged_at: string;
          synced_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["maintenance_log"]["Row"]> & {
          asset_id: string;
          technician_id: string;
          type: MaintenanceType;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["maintenance_log"]["Row"]>;
      };
      disposal: {
        Row: {
          id: string;
          asset_id: string;
          disposal_type: DisposalType;
          disposal_date: string;
          disposal_value: number | null;
          reason: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["disposal"]["Row"]> & {
          asset_id: string;
          disposal_type: DisposalType;
          disposal_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["disposal"]["Row"]>;
      };
    };
  };
}

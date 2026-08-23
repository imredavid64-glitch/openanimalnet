// src/lib/supabase/types.ts

export interface Database {
  public: {
    Tables: {
      sightings: {
        Row: {
          id: string;
          animalId: string;
          species: string;
          location: {
            lat: number;
            lng: number;
          };
          timestamp: string;
          notes: string;
          reportedBy: string;
          verified: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: Partial<Database["public"]["Tables"]["sightings"]["Row"]>;
      };
      access_logs: {
        Row: {
          id: string;
          serviceAnimalId: string;
          handlerName: string;
          location: string;
          timestamp: string;
          purpose: string;
          duration: string;
          status: 'granted' | 'denied' | 'pending';
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: Partial<Database["public"]["Tables"]["access_logs"]["Row"]>;
      };
      shelter_matches: {
        Row: {
          petId: string;
          petName: string;
          breed: string;
          matchScore: number;
          matchReasons: string[];
          shelter: string;
          contact: string;
          adopted: boolean;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: Partial<Database["public"]["Tables"]["shelter_matches"]["Row"]>;
      };
      sensor_readings: {
        Row: {
          sensorId: string;
          animalId: string;
          type: 'temperature' | 'humidity' | 'movement' | 'location' | 'sound';
          value: number;
          unit: string;
          timestamp: string;
          status: 'normal' | 'warning' | 'critical';
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: never;
        Update: Partial<Database["public"]["Tables"]["sensor_readings"]["Row"]>;
      };
    };
  };
}

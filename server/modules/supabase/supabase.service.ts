import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private client: SupabaseClient;

  onModuleInit(): void {
    const supabaseUrl =
      process.env.SUPABASE_URL ||
      'https://povfdlrxymcgiomxmrke.supabase.co';
    const supabaseAnonKey =
      process.env.SUPABASE_ANON_KEY ||
      'sb_publishable_Auq_0G48APhvQlSSjE543Q_FfYCU2Vx';

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be configured');
    }

    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  getClient(): SupabaseClient {
    return this.client;
  }
}

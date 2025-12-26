import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not configured. Some features may not work.');
}

// Admin client with service role key (for server-side operations)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Public client with anon key (for client-side safe operations)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function for database queries using Supabase
export const query = async (table, operation, params = {}) => {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured');
  }

  try {
    let queryBuilder = supabaseAdmin.from(table);

    switch (operation) {
      case 'select':
        queryBuilder = queryBuilder.select(params.columns || '*');
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              queryBuilder = queryBuilder.in(key, value);
            } else {
              queryBuilder = queryBuilder.eq(key, value);
            }
          });
        }
        if (params.order) {
          queryBuilder = queryBuilder.order(params.order.column, {
            ascending: params.order.ascending ?? true
          });
        }
        if (params.limit) {
          queryBuilder = queryBuilder.limit(params.limit);
        }
        if (params.offset) {
          queryBuilder = queryBuilder.range(params.offset, params.offset + (params.limit || 10) - 1);
        }
        break;

      case 'insert':
        queryBuilder = queryBuilder.insert(params.data).select();
        break;

      case 'update':
        queryBuilder = queryBuilder.update(params.data);
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        queryBuilder = queryBuilder.select();
        break;

      case 'delete':
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            queryBuilder = queryBuilder.eq(key, value);
          });
        }
        queryBuilder = queryBuilder.delete();
        break;

      case 'upsert':
        queryBuilder = queryBuilder.upsert(params.data).select();
        break;

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return { data, count };
  } catch (error) {
    console.error('Supabase query failed:', error);
    throw error;
  }
};

// Storage helpers
export const storage = {
  upload: async (bucket, path, file) => {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  },

  getPublicUrl: (bucket, path) => {
    if (!supabaseAdmin) return null;

    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);

    return data?.publicUrl;
  },

  delete: async (bucket, paths) => {
    if (!supabaseAdmin) throw new Error('Supabase not configured');

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(Array.isArray(paths) ? paths : [paths]);

    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscribeToTable = (table, callback, filters = {}) => {
  if (!supabase) {
    console.warn('Supabase not configured for real-time');
    return null;
  }

  let channel = supabase
    .channel(`${table}-changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        ...filters
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
};

export default supabaseAdmin;

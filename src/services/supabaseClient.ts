import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for Supabase
const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key-here' &&
    supabaseUrl.startsWith('https://')
  );
};

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return clientInstance;
}

/**
 * Storage helper for Profile Photos
 * Bucket: 'profile-photos'
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const supabase = getSupabase();
    
    // File validation
    const maxSizeBytes = 3 * 1024 * 1024; // 3MB limit
    if (file.size > maxSizeBytes) {
      return { success: false, error: 'File size must be less than 3MB.' };
    }
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Only JPEG, PNG and WebP images are allowed.' };
    }

    // Generate sanitized file path: userId/avatar-[timestamp].[ext]
    const fileExt = file.name.split('.').pop() || 'jpg';
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    if (supabase) {
      // 1. Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error, falling back to local object URL:', error.message);
        // Fallback if bucket doesn't exist yet
        const localDataUrl = await readFileAsDataUrl(file);
        return { success: true, url: localDataUrl };
      }

      // 2. Retrieve public URL
      const { data: publicData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(data.path);

      return { success: true, url: publicData.publicUrl };
    } else {
      // Offline / Local storage fallback: convert to base64 Data URL for persistence
      const dataUrl = await readFileAsDataUrl(file);
      return { success: true, url: dataUrl };
    }
  } catch (err: any) {
    console.error('Error uploading profile photo:', err);
    return { success: false, error: err?.message || 'Failed to upload photo.' };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

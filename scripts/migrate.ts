import { supabase } from '@/lib/supabase';

async function migrate() {
  try {
    // Add thumbnail column
    const { data, error } = await supabase.rpc('add_column', {
      table_name_in: 'articles',
      column_name_in: 'thumbnail',
      type_in: 'text'
    });

    if (error) {
      throw error;
    }

    console.log('Migration successful:', data);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate(); 
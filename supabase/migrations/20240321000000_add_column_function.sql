-- Create the add_column function
CREATE OR REPLACE FUNCTION public.add_column(
  schema_name_in text DEFAULT 'public',
  table_name_in text,
  column_name_in text,
  type_in text DEFAULT 'text',
  is_array boolean DEFAULT false
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  _type_exists BOOLEAN;
BEGIN
  -- Check if the type exists among common PostgreSQL types
  SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = type_in)
  INTO _type_exists;

  IF NOT _type_exists THEN
    RETURN 'Invalid type: ' || type_in;
  END IF;

  -- Add the column to the specified schema and table
  IF is_array THEN
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %I[];', schema_name_in, table_name_in, column_name_in, type_in);
  ELSE
    EXECUTE format('ALTER TABLE %I.%I ADD COLUMN %I %I;', schema_name_in, table_name_in, column_name_in, type_in);
  END IF;

  RETURN 'DONE';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$function$;

-- Revoke execute permission from public roles
REVOKE EXECUTE ON FUNCTION add_column FROM anon, authenticated; 
-- Enable storage extension
create extension if not exists "storage" schema "extensions";

-- Create news-images bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

-- Enable RLS
alter table storage.objects enable row level security;

-- Create policies
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'news-images' );

create policy "Authenticated users can upload images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'news-images'
);

create policy "Authenticated users can update their own images"
on storage.objects for update
to authenticated
using ( bucket_id = 'news-images' and owner = auth.uid() )
with check ( bucket_id = 'news-images' and owner = auth.uid() );

create policy "Authenticated users can delete their own images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'news-images' and owner = auth.uid() ); 
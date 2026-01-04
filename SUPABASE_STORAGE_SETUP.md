# Supabase Storage Setup

## Create the 'receipts' Storage Bucket

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/ozqoeqpfkeafqvwjswll/storage/buckets

2. Click **"New bucket"**

3. Configure the bucket:
   - **Name**: `receipts`
   - **Public bucket**: ✅ **Check this** (so admins can view receipts via URL)
   - Click **"Create bucket"**

4. Set up Storage Policies:

Go to Storage > Policies for the `receipts` bucket and add:

### Policy 1: Allow lawyers to upload their own receipts
```sql
CREATE POLICY "Lawyers can upload receipts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow lawyers to view their own receipts
```sql
CREATE POLICY "Lawyers can view own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Allow public access (so admins can view)
```sql
CREATE POLICY "Public can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');
```

## Verify Setup

After creating the bucket, test by:
1. Having a lawyer upload a payment receipt
2. Check that the receipt appears in Storage > receipts
3. Verify the admin can view the receipt in the admin panel

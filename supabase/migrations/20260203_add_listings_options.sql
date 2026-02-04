-- Add options column to listings table for service add-ons
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS options jsonb DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN public.listings.options IS 'Array of service options: [{ label: string, price: number }]';

-- Optionally add index for faster queries on options
CREATE INDEX IF NOT EXISTS idx_listings_options_gin ON public.listings USING gin (options);
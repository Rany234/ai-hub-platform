-- Alter the CHECK constraint on the profiles table to allow 'client' and 'freelancer' roles

-- First, drop the existing constraint
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Then, add the new, correct constraint
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role IN ('client', 'freelancer', 'admin'));

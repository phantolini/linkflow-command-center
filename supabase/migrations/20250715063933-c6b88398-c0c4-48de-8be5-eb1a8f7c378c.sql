
-- Fix the security warnings by setting proper search_path for functions
CREATE OR REPLACE FUNCTION public.populate_link_click_profile_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  SELECT profile_id INTO NEW.profile_id
  FROM public.links
  WHERE id = NEW.link_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

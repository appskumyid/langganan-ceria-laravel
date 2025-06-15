
CREATE OR REPLACE FUNCTION get_random_managed_products(limit_count integer)
RETURNS SETOF managed_products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.managed_products
  ORDER BY RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

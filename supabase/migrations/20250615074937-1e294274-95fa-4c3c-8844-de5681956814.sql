
CREATE OR REPLACE FUNCTION get_random_store_products(limit_count integer)
RETURNS SETOF store_products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.store_products
  ORDER BY RANDOM()
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

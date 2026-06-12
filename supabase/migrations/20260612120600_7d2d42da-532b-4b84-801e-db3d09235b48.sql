
-- Restrict SECURITY DEFINER function executability
REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

-- Replace permissive INSERT policies with length-validated versions
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contacts;
CREATE POLICY "Anyone can submit contact" ON public.contacts FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 254
    AND char_length(message) BETWEEN 1 AND 4000
    AND char_length(coalesce(subject,'')) <= 200
    AND char_length(coalesce(phone,'')) <= 40
  );

DROP POLICY IF EXISTS "Anyone submits orders" ON public.orders;
CREATE POLICY "Anyone submits orders" ON public.orders FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 120
    AND char_length(email) BETWEEN 3 AND 254
    AND char_length(budget) BETWEEN 1 AND 60
    AND char_length(message) <= 4000
    AND char_length(coalesce(phone,'')) <= 40
    AND char_length(coalesce(company,'')) <= 200
  );

DROP POLICY IF EXISTS "Anyone subscribes" ON public.newsletter_subscribers;
CREATE POLICY "Anyone subscribes" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(email) BETWEEN 3 AND 254);

-- Storage policies for order-files: uploads allowed to "uploads/" prefix; only admins read/delete
CREATE POLICY "Public can upload order files" ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'order-files' AND (storage.foldername(name))[1] = 'uploads');
CREATE POLICY "Admins read order files" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete order files" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'order-files' AND public.has_role(auth.uid(), 'admin'));

-- OPTIONAL — local development only. These are FICTIONAL demo rows.
-- They are NOT published (is_published=false). Never publish them as real customers.
insert into public.contributions
  (customer_display_name, project_name, service_type, amount, is_anonymous, consent_to_public_display, is_published)
values
  ('DEMO · Local Business',      'Website Development', 'Website',      5000, false, false, false),
  ('DEMO · Independent Creator', 'Portfolio Website',   'Website',      2500, false, false, false),
  ('DEMO · Startup Founder',     'Landing Page',        'Landing page', 8000, false, false, false);

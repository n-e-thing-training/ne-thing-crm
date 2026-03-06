insert into courses (name, code, duration_minutes)
values
  ('CPR/AED Adult and Pediatric', 'CPR-AED', 180),
  ('First Aid Basics', 'FA-BASIC', 120),
  ('BLS Provider', 'BLS', 240)
on conflict (name) do nothing;

insert into message_templates (type, name, subject, body, active)
values
  (
    'sms',
    'Default SMS Reminder',
    null,
    'Hi {{participant_first_name}}, reminder: your class is {{class_date}} at {{class_time}} at {{class_location}} with {{instructor_name}}.',
    true
  ),
  (
    'email',
    'Default Email Reminder',
    'Training Reminder for {{class_date}}',
    'Hello {{participant_first_name}},\n\nThis is your reminder for class on {{class_date}} at {{class_time}}.\nLocation: {{class_location}}\nInstructor: {{instructor_name}}\n\nThank you.',
    true
  )
on conflict do nothing;

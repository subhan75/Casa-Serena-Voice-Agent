-- Phase 1: Seed data for Casa Serena Apartments
-- Run this after 001_create_tables.sql

-- Seed units table (8 units: mix of 1, 2, and 3-bedroom)
INSERT INTO units (unit_number, bedrooms, price, available_date, is_available) VALUES
('101', 1, 1200.00, '2026-08-01', true),
('102', 2, 1800.00, '2026-07-28', true),
('103', 2, 1850.00, '2026-09-15', false),
('104', 3, 2400.00, '2026-08-01', true),
('201', 1, 1250.00, '2026-10-01', false),
('202', 2, 1900.00, '2026-07-28', true),
('203', 3, 2500.00, '2026-08-15', true),
('204', 2, 1800.00, '2026-07-28', true),
('301', 1, 1300.00, '2026-11-01', false),
('302', 3, 2600.00, '2026-09-01', false)
ON CONFLICT (unit_number) DO NOTHING;

-- Seed residents table (8 residents matched to existing units)
INSERT INTO residents (resident_id, name, unit_number, lease_end_date, phone) VALUES
('RES001', 'Sarah Mitchell', '102', '2027-06-30', '555-0101'),
('RES002', 'James Chen', '104', '2027-12-31', '555-0102'),
('RES003', 'Maria Rodriguez', '202', '2027-03-31', '555-0103'),
('RES004', 'David Thompson', '203', '2027-08-31', '555-0104'),
('RES005', 'Emma Johnson', '204', '2028-01-31', '555-0105'),
('RES006', 'Michael Brown', '201', '2026-09-30', '555-0106'),
('RES007', 'Lisa Anderson', '301', '2027-07-31', '555-0107'),
('RES008', 'Robert Wilson', '302', '2028-02-28', '555-0108')
ON CONFLICT (resident_id) DO NOTHING;

-- Seed faqs table (15 FAQs covering common questions)
INSERT INTO faqs (faq_id, question, answer, audience) VALUES
('FAQ001', 'What is the pet policy at Casa Serena?', 'We welcome pets! We allow up to two pets per unit (dogs, cats, small animals). A one-time pet deposit of $300 applies. Breed restrictions do not apply, but we ask that all pets be well-behaved and not pose a risk to other residents.', 'both'),
('FAQ002', 'Is there designated parking available?', 'Yes, each unit includes one assigned parking space in our covered lot. Additional spaces are available for a monthly fee of $75. We also offer guest parking near the main entrance.', 'both'),
('FAQ003', 'What amenities does Casa Serena offer?', 'Residents enjoy access to our fitness center, resort-style pool and spa, community lounge, outdoor grilling area, and high-speed internet included in rent. We also host monthly social events.', 'both'),
('FAQ004', 'What is the lease term?', 'Standard leases are 12 months. We also offer flexible 6-month and month-to-month options at different rates. All lease terms include the same amenities and services.', 'prospect'),
('FAQ005', 'Are utilities included in the rent?', 'Water, trash, and recycling are included in your rent. Electricity and gas are tenant-paid. Internet and cable packages are available for additional fees.', 'both'),
('FAQ006', 'When can I move in?', 'Move-in dates vary by unit. All units shown on our website display their availability date. Most units are available within 1-2 weeks of lease signing.', 'prospect'),
('FAQ007', 'Do you require a deposit?', 'Yes, we require a refundable security deposit equal to one month''s rent, plus any applicable pet deposits. This is returned after move-out inspection if all terms are met.', 'prospect'),
('FAQ008', 'How do I schedule maintenance?', 'Residents can submit maintenance requests through our online portal or by calling the leasing office. Emergency repairs (plumbing, heating) are prioritized and typically handled within 24 hours.', 'resident'),
('FAQ009', 'What is the noise policy?', 'Quiet hours are 10 PM to 8 AM. Music, TV, and conversations should be kept at reasonable levels during quiet hours. Excessive noise may result in a lease violation notice.', 'both'),
('FAQ010', 'Is there a gym or fitness center?', 'Yes, Casa Serena features a fully equipped fitness center open 24/7 with cardio equipment, free weights, and strength training machines. Fitness classes are offered twice weekly at no additional cost.', 'both'),
('FAQ011', 'Can I have guests over?', 'Of course! Guests are welcome. Extended stays (more than 14 consecutive days) require written approval from management. Please notify the front desk if you are having overnight guests.', 'both'),
('FAQ012', 'What is the application process?', 'The application takes about 15 minutes. We require a valid ID, proof of income, and a credit/background check ($35 fee). Most applications are approved within 24-48 hours.', 'prospect'),
('FAQ013', 'Are there washer/dryer hookups?', 'Yes, all units include washer/dryer hookups. In-unit laundry machines are available for purchase or you can use our community laundry facility at no cost.', 'both'),
('FAQ014', 'What is the lease renewal process?', 'Lease renewal notices are sent 60 days before your lease expires. You''ll receive renewal terms (which may differ from your current lease). Please respond within 30 days to confirm renewal.', 'resident'),
('FAQ015', 'Is there a community manager on site?', 'Yes, our management office is located at the main entrance and is staffed Monday-Friday, 9 AM - 6 PM, and Saturday 10 AM - 4 PM. An emergency contact line is available 24/7 for urgent issues.', 'both')
ON CONFLICT (faq_id) DO NOTHING;

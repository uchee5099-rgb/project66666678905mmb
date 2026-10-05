-- ============================================================
-- EarnFlow - Realistic Seed Data (PostgreSQL)
-- Note: Passwords below correspond to:
-- admin@earnflow.ng -> AdminPass123!
-- chidi@earnflow.ng -> UserPass123!
-- amaka@earnflow.ng -> UserPass123!
-- ============================================================

-- 1. System Settings
INSERT INTO system_settings (key, value, description) VALUES
('min_withdrawal', '1000.00', 'Minimum withdrawal amount in NGN (₦)'),
('referral_bonus', '250.00', 'Bonus reward for each successful referral in NGN (₦)'),
('platform_name', 'EarnFlow', 'Public brand name'),
('contact_email', 'support@earnflow.ng', 'Official support contact email'),
('maintenance_mode', 'false', 'Platform maintenance status toggle')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Users (Bcrypt hashes for AdminPass123! and UserPass123!)
-- Hash for AdminPass123!: $2a$10$fV3Jz8h90bQ2tZ4sN43eOuU03E48fR5d098tZ4sN43eOuU03E48fR (or standard test hash)
INSERT INTO users (id, full_name, email, phone, password_hash, referral_code, role, status) VALUES
(1, 'EarnFlow Administrator', 'admin@earnflow.ng', '+2348012345678', '$2a$10$eE4aQ.rEomU3JmsqIuD.r.e/HlU5b7N3rCj9Y6/Y5eM4nF9M2Jk9.', 'ADMIN001', 'admin', 'active'),
(2, 'Chidi Okonkwo', 'chidi@earnflow.ng', '+2348023456789', '$2a$10$eE4aQ.rEomU3JmsqIuD.r.e/HlU5b7N3rCj9Y6/Y5eM4nF9M2Jk9.', 'CHIDI88', 'user', 'active'),
(3, 'Amaka Eze', 'amaka@earnflow.ng', '+2348034567890', '$2a$10$eE4aQ.rEomU3JmsqIuD.r.e/HlU5b7N3rCj9Y6/Y5eM4nF9M2Jk9.', 'AMAKA21', 'user', 'active')
ON CONFLICT (id) DO NOTHING;

-- Link referral: Amaka was referred by Chidi
UPDATE users SET referred_by = 2 WHERE id = 3;

-- 3. Wallets
INSERT INTO wallets (user_id, available_balance, total_earned, pending_rewards, referral_rewards, total_withdrawn) VALUES
(1, 0.00, 0.00, 0.00, 0.00, 0.00),
(2, 3500.00, 6000.00, 1050.00, 500.00, 2500.00),
(3, 850.00, 850.00, 600.00, 0.00, 0.00)
ON CONFLICT (user_id) DO NOTHING;

-- 4. Tasks
INSERT INTO tasks (id, title, category, reward_amount, estimated_minutes, description, instructions, requirements, proof_type, max_participants, status) VALUES
(1, 'Fintech Usability & Mobile Banking Survey', 'Surveys', 350.00, 5, 
 'Share your honest feedback about everyday mobile banking experiences in Nigeria to help improve fintech services.',
 '1. Open the survey link.\n2. Answer all 8 questions about your preferred banking apps.\n3. Copy the completion code shown on the final thank-you page.\n4. Paste the completion code below and submit.',
 'Must complete all survey questions thoughtfully. Spam or random answers will be rejected.',
 'text', 1500, 'active'),

(2, 'Test PalmPay Virtual Card Feature Flow', 'Apps', 600.00, 10,
 'Test the onboarding process and navigation of the PalmPay virtual card feature and report your user experience.',
 '1. Open the PalmPay mobile app.\n2. Navigate to Finance -> Cards.\n3. Take a screenshot showing the card setup screen.\n4. Describe one feature that was easy to use and one that could be improved.',
 'Must submit a valid screenshot and at least two sentences of feedback.',
 'text_or_screenshot', 500, 'active'),

(3, 'Follow & Repost EarnFlow on X (Twitter)', 'Social', 200.00, 3,
 'Support our community by following the official EarnFlow account and reposting our pinned announcement.',
 '1. Visit twitter.com/EarnFlowHQ.\n2. Click Follow.\n3. Repost our pinned post.\n4. Submit your Twitter handle and direct link to your repost.',
 'Twitter account must have at least 15 followers and be older than 30 days.',
 'text', 2000, 'active'),

(4, 'Write Honest Review for Kuda MFB on Play Store', 'Reviews', 500.00, 7,
 'Submit an informative review of Kuda Bank on the Google Play Store or Apple App Store.',
 '1. Open the app store and find Kuda.\n2. Rate and write a genuine review with at least 30 words.\n3. Take a screenshot showing your published review with your reviewer username.\n4. Submit the screenshot or review link.',
 'Must be your genuine review. Copied text will be rejected immediately.',
 'text_or_screenshot', 800, 'active'),

(5, 'Nigerian Online Shopping Experience Feedback', 'Surveys', 450.00, 6,
 'Provide insights into your delivery and checkout experiences with local e-commerce stores.',
 '1. Complete our 10-minute consumer shopping questionnaire.\n2. Provide details on shipping speed, delivery fees, and customer service.\n3. Submit your completion confirmation token.',
 'Valid completion token required.',
 'text', 1000, 'active'),

(6, 'Join EarnFlow Telegram Announcement Channel', 'Social', 150.00, 2,
 'Join our official Telegram community to stay updated on high-value daily task drops and withdrawal updates.',
 '1. Click the Telegram invite link.\n2. Join the channel.\n3. Submit your Telegram username (e.g., @username) for verification.',
 'Must remain in the channel for at least 14 days.',
 'text', 5000, 'active')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence counters
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks));

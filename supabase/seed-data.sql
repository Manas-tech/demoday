-- Insert mock users (these will be created via Supabase Auth, but we'll add profile data)
-- Note: You'll need to create these users in Supabase Auth first, then update their profiles

-- Insert mock speakers
INSERT INTO speakers (name, slug, title, company, bio, image_url, image_square_url, linkedin) VALUES
('Sarah Chen', 'sarah-chen', 'Moderator', 'TechVentures Capital', 'Sarah Chen is a seasoned venture capitalist and angel investor with over 15 years of experience in the technology sector. She specializes in early-stage investments in AI, SaaS, and enterprise software companies. Sarah has been instrumental in helping numerous startups scale and achieve successful exits.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop', 'https://linkedin.com/in/sarah-chen'),
('Michael Rodriguez', 'michael-rodriguez', 'Panelist', 'Innovation Partners', 'Michael Rodriguez is a serial entrepreneur and investor with a passion for building transformative technology companies. He has founded and scaled multiple startups, bringing deep operational expertise to discussions on the future of business with AI and automation.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop', 'https://linkedin.com/in/michael-rodriguez'),
('Emily Watson', 'emily-watson', 'Panelist', 'Future Labs', 'Emily Watson is a technology executive and thought leader in the field of artificial intelligence and machine learning. With a background in both academia and industry, she brings unique perspectives on how AI is reshaping industries and business models.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop', 'https://linkedin.com/in/emily-watson'),
('David Kim', 'david-kim', 'Panelist', 'Scale Ventures', 'David Kim is a venture partner with extensive experience in early-stage investing and startup ecosystem development. He has been instrumental in supporting numerous successful startups across various sectors, from fintech to healthcare technology.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop', 'https://linkedin.com/in/david-kim')
ON CONFLICT (slug) DO NOTHING;

-- Insert mock companies
INSERT INTO companies (name, slug, description, short_description, website, call_to_action, call_to_action_link, discord, tier, youtube_slug, card_image_url, logo_url, founders) VALUES
('BuildFlow', 'buildflow', 'AI-powered construction SaaS platform that streamlines project scheduling, document management, and progress tracking. It connects daily reports to project schedules, provides real-time insights, automates administrative tasks like subcontractor reminders and material tracking, and uses an AI co-pilot to answer queries, suggest optimized schedules, and help teams make data-driven decisions to reduce delays, improve efficiency, and save costs.', 'AI-powered construction SaaS that optimizes project scheduling, document management, and progress tracking.', 'https://buildflow.com', 'Website', 'https://buildflow.com', 'alex@buildflow.com', 'Cohort 11', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=200&fit=crop', 'Alex Thompson'),
('TaskSync', 'tasksync', 'TaskSync helps teams to get projects done without project manager. Our platform automates project coordination, task assignment, and progress tracking, enabling teams to collaborate effectively without the overhead of traditional project management roles.', 'TaskSync helps teams to get projects done without project manager.', 'https://tasksync.com', 'Website', 'https://tasksync.com', 'maria@tasksync.com', 'Cohort 11', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&h=200&fit=crop', 'Maria Garcia'),
('CyberSafe Kids', 'cybersafe-kids', 'Gamified cyber safety curriculum for ages 9-15. CyberSafe Kids makes learning about online safety engaging and fun through interactive games, challenges, and real-world scenarios. Our platform teaches children and teens how to protect themselves online while having fun.', 'Gamified cyber safety curriculum for ages 9-15.', 'https://cybersafekids.com', 'Website', 'https://cybersafekids.com', 'james@cybersafekids.com', 'Cohort 11', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop', 'James Wilson'),
('DataFlow Analytics', 'dataflow-analytics', 'Enterprise data analytics platform that transforms raw data into actionable business insights. DataFlow Analytics provides real-time dashboards, predictive analytics, and automated reporting to help businesses make data-driven decisions faster and more accurately.', 'Enterprise data analytics platform that transforms raw data into actionable business insights.', 'https://dataflow.com', 'Website', 'https://dataflow.com', 'lisa@dataflow.com', 'Cohort 11', 'dQw4w9WgXcQ', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop', 'Lisa Anderson')
ON CONFLICT (slug) DO NOTHING;

-- Insert company links (resources)
INSERT INTO company_links (company_id, text, url)
SELECT id, 'One Pager', 'https://example.com/onepager.pdf'
FROM companies WHERE slug = 'buildflow'
ON CONFLICT DO NOTHING;

INSERT INTO company_links (company_id, text, url)
SELECT id, 'One Pager', 'https://example.com/onepager.pdf'
FROM companies WHERE slug = 'tasksync'
ON CONFLICT DO NOTHING;

INSERT INTO company_links (company_id, text, url)
SELECT id, 'One Pager', 'https://example.com/onepager.pdf'
FROM companies WHERE slug = 'cybersafe-kids'
ON CONFLICT DO NOTHING;

INSERT INTO company_links (company_id, text, url)
SELECT id, 'One Pager', 'https://example.com/onepager.pdf'
FROM companies WHERE slug = 'dataflow-analytics'
ON CONFLICT DO NOTHING;


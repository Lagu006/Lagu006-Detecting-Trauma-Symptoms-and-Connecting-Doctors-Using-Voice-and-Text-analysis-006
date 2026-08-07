-- ==============================================================================
-- TRAUMAGUARD AI: SUPABASE COMPLETE DATABASE SCHEMA
-- Copy and paste this into your Supabase SQL Editor and click "Run"
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  gender TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_profile_all" ON public.profiles;
CREATE POLICY "own_profile_all" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 2. CHAT THREADS TABLE
CREATE TABLE IF NOT EXISTS public.chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New session',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_threads_user_idx ON public.chat_threads(user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_threads TO authenticated;
GRANT ALL ON public.chat_threads TO service_role;
ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_threads_all" ON public.chat_threads;
CREATE POLICY "own_threads_all" ON public.chat_threads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.chat_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  severity TEXT,
  matched_condition TEXT,
  confidence NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS chat_messages_thread_idx ON public.chat_messages(thread_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_messages_all" ON public.chat_messages;
CREATE POLICY "own_messages_all" ON public.chat_messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. MOOD LOGS / RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_score NUMERIC NOT NULL,
  mood TEXT,
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS mood_logs_user_idx ON public.mood_logs(user_id, logged_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_logs TO authenticated;
GRANT ALL ON public.mood_logs TO service_role;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_moodlogs_all" ON public.mood_logs;
CREATE POLICY "own_moodlogs_all" ON public.mood_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. DOCTORS DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  languages TEXT[] NOT NULL DEFAULT ARRAY['en']::TEXT[],
  city TEXT,
  phone TEXT,
  email TEXT,
  bio TEXT,
  years_experience INT,
  rating NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "doctors_read_all" ON public.doctors;
CREATE POLICY "doctors_read_all" ON public.doctors FOR SELECT TO authenticated USING (true);

-- Insert Default Doctors Seed Data
INSERT INTO public.doctors (name, specialty, languages, city, phone, bio, years_experience, rating)
SELECT 'Dr. Aarav Sharma', 'Trauma & PTSD Specialist', ARRAY['en','hi'], 'Mumbai', '+91-98200-11111', 'Clinical psychologist with a focus on trauma-informed care.', 14, 4.9
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Aarav Sharma');

INSERT INTO public.doctors (name, specialty, languages, city, phone, bio, years_experience, rating)
SELECT 'Dr. Kavya Reddy', 'Clinical Psychologist', ARRAY['en','te','hi'], 'Hyderabad', '+91-98200-22222', 'Specializes in anxiety, depression, and post-traumatic stress.', 11, 4.8
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Kavya Reddy');

INSERT INTO public.doctors (name, specialty, languages, city, phone, bio, years_experience, rating)
SELECT 'Dr. Meera Iyer', 'Psychiatrist', ARRAY['en','ta','hi'], 'Chennai', '+91-98200-33333', 'Trauma-focused psychiatry and pharmacotherapy.', 18, 4.7
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Meera Iyer');

INSERT INTO public.doctors (name, specialty, languages, city, phone, bio, years_experience, rating)
SELECT 'Dr. Rohan Desai', 'Trauma Therapist', ARRAY['en','gu','hi','mr'], 'Ahmedabad', '+91-98200-44444', 'EMDR and CBT-based trauma therapy.', 9, 4.8
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Rohan Desai');

INSERT INTO public.doctors (name, specialty, languages, city, phone, bio, years_experience, rating)
SELECT 'Dr. Simran Kaur', 'Counselling Psychologist', ARRAY['en','pa','hi'], 'Chandigarh', '+91-98200-55555', 'Adolescent and young-adult trauma support.', 7, 4.6
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Simran Kaur');

INSERT INTO public.doctors (name, specialty, languages, city, phone, bio, years_experience, rating)
SELECT 'Dr. Neha Kulkarni', 'Psychiatrist', ARRAY['en','mr','hi'], 'Pune', '+91-98200-66666', 'Complex trauma and dissociation specialist.', 15, 4.9
WHERE NOT EXISTS (SELECT 1 FROM public.doctors WHERE name = 'Dr. Neha Kulkarni');

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  kind TEXT NOT NULL DEFAULT 'info',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_notifs_all" ON public.notifications;
CREATE POLICY "own_notifs_all" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. NOTIFICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  emergency_alerts boolean NOT NULL DEFAULT true,
  crisis_escalation boolean NOT NULL DEFAULT true,
  emergency_contact_phone text,
  daily_checkin boolean NOT NULL DEFAULT true,
  daily_checkin_time text NOT NULL DEFAULT '09:00',
  weekly_report boolean NOT NULL DEFAULT true,
  appointment_reminders boolean NOT NULL DEFAULT true,
  medication_reminders boolean NOT NULL DEFAULT false,
  quiet_hours_enabled boolean NOT NULL DEFAULT false,
  quiet_hours_start text NOT NULL DEFAULT '22:00',
  quiet_hours_end text NOT NULL DEFAULT '07:00',
  channel_in_app boolean NOT NULL DEFAULT true,
  channel_email boolean NOT NULL DEFAULT true,
  channel_sms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_notif_prefs_all" ON public.notification_preferences;
CREATE POLICY "own_notif_prefs_all" ON public.notification_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. HELPER TRIGGERS
CREATE OR REPLACE FUNCTION public.tg_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS profiles_upd ON public.profiles;
CREATE TRIGGER profiles_upd BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

DROP TRIGGER IF EXISTS threads_upd ON public.chat_threads;
CREATE TRIGGER threads_upd BEFORE UPDATE ON public.chat_threads FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

DROP TRIGGER IF EXISTS notification_preferences_updated_at ON public.notification_preferences;
CREATE TRIGGER notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.tg_updated_at();

-- Auto-create profile trigger on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, gender, language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
    NEW.raw_user_meta_data->>'gender',
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. UPLOADED MEDICAL DOCUMENTS & PHOTOS TABLE (PAST VS PRESENT COMPARATIVE VAULT)
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT DEFAULT 0,
  category TEXT DEFAULT 'Previous Psychological Assessment',
  past_distress_score INT DEFAULT 70,
  past_date TEXT DEFAULT '2025-10-15',
  past_symptoms TEXT DEFAULT '',
  extracted_summary TEXT DEFAULT '',
  file_url TEXT DEFAULT '',
  file_data TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS uploaded_docs_user_idx ON public.uploaded_documents(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uploaded_documents TO authenticated;
GRANT ALL ON public.uploaded_documents TO service_role;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_documents_all" ON public.uploaded_documents;
CREATE POLICY "own_documents_all" ON public.uploaded_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (for survey platform users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  user_role TEXT NOT NULL CHECK (user_role IN ('creator', 'filler')),
  wallet_balance DECIMAL(10, 2) DEFAULT 0,
  total_surveys_created INTEGER DEFAULT 0,
  total_responses_filled INTEGER DEFAULT 0,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'suspended', 'banned')),
  suspension_end_date TIMESTAMP WITH TIME ZONE,
  total_reports INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  verified BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Surveys Table
CREATE TABLE IF NOT EXISTS surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'downed')),
  category TEXT,
  reward_per_response DECIMAL(10, 2) NOT NULL,
  total_responses_collected INTEGER DEFAULT 0,
  target_responses INTEGER NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  total_reports INTEGER DEFAULT 0
);

-- Survey Questions Table
CREATE TABLE IF NOT EXISTS survey_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'multiple_choice', 'rating', 'checkbox')),
  options JSONB,
  "order" INTEGER NOT NULL,
  required BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Survey Responses Table
CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type TEXT NOT NULL CHECK (report_type IN ('survey', 'user')),
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  attachments TEXT[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_action TEXT,
  admin_notes TEXT,
  report_count INTEGER DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Moderation Logs Table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('warning', 'survey_down', 'account_suspend', 'account_ban', 'dismiss_report')),
  target_type TEXT NOT NULL CHECK (target_type IN ('survey', 'user')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  notes TEXT,
  duration_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- User Strikes Table
CREATE TABLE IF NOT EXISTS user_strikes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strike_count INTEGER DEFAULT 1,
  last_strike_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit', 'refund')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  description TEXT
);

-- Withdrawals Table
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  bank_account TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Notifications Table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Realtime Alerts Table
CREATE TABLE IF NOT EXISTS realtime_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin Action Audit Log Table
CREATE TABLE IF NOT EXISTS admin_action_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for better query performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_surveys_creator_id ON surveys(creator_id);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_created_at ON surveys(created_at);
CREATE INDEX idx_survey_questions_survey_id ON survey_questions(survey_id);
CREATE INDEX idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_responder_id ON survey_responses(responder_id);
CREATE INDEX idx_reports_target_id ON reports(target_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
CREATE INDEX idx_moderation_logs_admin_id ON moderation_logs(admin_id);
CREATE INDEX idx_moderation_logs_target_id ON moderation_logs(target_id);
CREATE INDEX idx_user_strikes_user_id ON user_strikes(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_admin_notifications_admin_id ON admin_notifications(admin_id);
CREATE INDEX idx_admin_action_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX idx_admin_action_logs_created_at ON admin_action_logs(created_at);

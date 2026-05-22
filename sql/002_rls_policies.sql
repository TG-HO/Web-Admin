-- Row Level Security (RLS) Policies

-- Admin Users - Only admins can view/manage other admins
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view all admin users" ON admin_users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role = 'super_admin'
    )
  );

-- Users - Admins can view all users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Admins can update users" ON users
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

-- Surveys - Admins can view all surveys
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all surveys" ON surveys
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage surveys" ON surveys
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

-- Survey Questions
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view survey questions" ON survey_questions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Survey Responses
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view survey responses" ON survey_responses
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Reports - Admins can view and manage reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reports" ON reports
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage reports" ON reports
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

-- Moderation Logs - Admins can view and create logs
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view moderation logs" ON moderation_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

CREATE POLICY "Admins can create moderation logs" ON moderation_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

-- User Strikes
ALTER TABLE user_strikes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view user strikes" ON user_strikes
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view transactions" ON transactions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

-- Withdrawals
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view withdrawals" ON withdrawals
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can manage withdrawals" ON withdrawals
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

-- Admin Notifications
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their own notifications" ON admin_notifications
  FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Admins can update their own notifications" ON admin_notifications
  FOR UPDATE
  USING (admin_id = auth.uid());

-- Realtime Alerts
ALTER TABLE realtime_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view realtime alerts" ON realtime_alerts
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

-- Admin Action Logs
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view action logs" ON admin_action_logs
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Admins can create action logs" ON admin_action_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM admin_users WHERE role IN ('super_admin', 'admin', 'moderator')
    )
  );

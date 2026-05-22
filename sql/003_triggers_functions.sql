-- Triggers and Functions for Auto-Moderation Logic

-- Function to check report count and auto-suspend
CREATE OR REPLACE FUNCTION check_report_threshold()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    report_count INTEGER;
    target_user_id UUID;
  BEGIN
    -- Only process survey and user reports
    IF NEW.report_type IN ('survey', 'user') THEN
      -- Get current report count
      SELECT COUNT(*) INTO report_count
      FROM reports
      WHERE target_id = NEW.target_id
        AND report_type = NEW.report_type
        AND status != 'dismissed';

      -- If user report with 3+ reports, auto-suspend
      IF NEW.report_type = 'user' AND report_count >= 3 THEN
        UPDATE users
        SET status = 'suspended',
            suspension_end_date = NOW() + INTERVAL '7 days'
        WHERE id = NEW.target_id AND status = 'active';
      END IF;

      -- If survey report with 2+ reports, create alert
      IF NEW.report_type = 'survey' AND report_count >= 2 THEN
        INSERT INTO realtime_alerts (type, severity, title, message, metadata)
        VALUES (
          'report_threshold',
          'warning',
          'Survey reached report threshold',
          'Survey has received 2 reports and requires review',
          jsonb_build_object('survey_id', NEW.target_id, 'report_count', report_count)
        );
      END IF;
    END IF;

    RETURN NEW;
  END;
$$ LANGUAGE plpgsql;

-- Trigger to check report threshold on insert
CREATE TRIGGER trg_check_report_threshold
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION check_report_threshold();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO admin_action_logs (
      admin_id,
      action,
      target_type,
      old_values,
      new_values,
      created_at
    )
    VALUES (
      COALESCE(current_setting('app.current_user_id')::uuid, auth.uid()),
      'update',
      TG_TABLE_NAME,
      row_to_json(OLD),
      row_to_json(NEW),
      NOW()
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO admin_action_logs (
      admin_id,
      action,
      target_type,
      old_values,
      created_at
    )
    VALUES (
      COALESCE(current_setting('app.current_user_id')::uuid, auth.uid()),
      'delete',
      TG_TABLE_NAME,
      row_to_json(OLD),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to log admin actions on important tables
CREATE TRIGGER trg_log_user_changes
AFTER UPDATE OR DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER trg_log_survey_changes
AFTER UPDATE OR DELETE ON surveys
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER trg_log_report_changes
AFTER UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION log_admin_action();

-- Function to update user report count when new report is created
CREATE OR REPLACE FUNCTION update_user_report_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.report_type = 'user' THEN
    UPDATE users
    SET total_reports = total_reports + 1
    WHERE id = NEW.target_id;
  ELSIF NEW.report_type = 'survey' THEN
    UPDATE surveys
    SET total_reports = total_reports + 1
    WHERE id = NEW.target_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update report counts
CREATE TRIGGER trg_update_report_count
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION update_user_report_count();

-- Function to update user suspension status based on duration
CREATE OR REPLACE FUNCTION update_suspension_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'suspended' AND NEW.suspension_end_date IS NOT NULL THEN
    -- Check if suspension should be lifted
    IF NEW.suspension_end_date <= NOW() THEN
      NEW.status = 'active';
      NEW.suspension_end_date = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update suspension status
CREATE TRIGGER trg_update_suspension_status
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_suspension_status();

-- Function to update survey response count
CREATE OR REPLACE FUNCTION update_survey_response_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE surveys
  SET total_responses_collected = total_responses_collected + 1
  WHERE id = NEW.survey_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update survey response count
CREATE TRIGGER trg_update_survey_response_count
AFTER INSERT ON survey_responses
FOR EACH ROW
EXECUTE FUNCTION update_survey_response_count();

-- Function to create withdrawal transaction
CREATE OR REPLACE FUNCTION create_withdrawal_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO transactions (
      user_id,
      amount,
      type,
      reason,
      status,
      description
    )
    VALUES (
      NEW.user_id,
      -NEW.amount,
      'debit',
      'Withdrawal',
      'completed',
      'Withdrawal processed: ' || NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to handle withdrawal transactions
CREATE TRIGGER trg_create_withdrawal_transaction
AFTER UPDATE ON withdrawals
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION create_withdrawal_transaction();

-- Function to update user updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER trg_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_timestamp();

CREATE TRIGGER trg_surveys_timestamp
BEFORE UPDATE ON surveys
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_transactions_timestamp
BEFORE UPDATE ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_withdrawals_timestamp
BEFORE UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Generic timestamp update function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

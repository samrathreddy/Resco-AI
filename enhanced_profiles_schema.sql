-- Enhanced profiles table with plan types, limits, and usage tracking
-- Drop existing table if needed (uncomment if rebuilding)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Create enhanced profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text,
  
  -- Plan and subscription info
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'pro', 'enterprise', 'unlimited')),
  plan_status text NOT NULL DEFAULT 'active' CHECK (plan_status IN ('active', 'suspended', 'cancelled', 'trial')),
  subscription_id text, -- External subscription ID (Stripe, etc.)
  trial_ends_at timestamptz,
  subscription_ends_at timestamptz,
  
  -- Usage limits (monthly limits)
  monthly_resume_limit integer NOT NULL DEFAULT 10, -- Resume uploads per month
  monthly_analysis_limit integer NOT NULL DEFAULT 50, -- AI analyses per month
  monthly_export_limit integer NOT NULL DEFAULT 20, -- Exports per month
  storage_limit_mb integer NOT NULL DEFAULT 100, -- Storage limit in MB
  
  -- Current usage tracking
  current_resume_count integer NOT NULL DEFAULT 0,
  current_analysis_count integer NOT NULL DEFAULT 0,
  current_export_count integer NOT NULL DEFAULT 0,
  current_storage_used_mb integer NOT NULL DEFAULT 0,
  
  -- Usage reset tracking
  usage_reset_at timestamptz NOT NULL DEFAULT date_trunc('month', now() + interval '1 month'),
  last_usage_reset timestamptz NOT NULL DEFAULT date_trunc('month', now()),
  
  -- Rate limiting (per day)
  daily_api_limit integer NOT NULL DEFAULT 1000,
  current_daily_api_count integer NOT NULL DEFAULT 0,
  daily_reset_at timestamptz NOT NULL DEFAULT date_trunc('day', now() + interval '1 day'),
  last_daily_reset timestamptz NOT NULL DEFAULT date_trunc('day', now()),
  
  -- Feature flags
  features jsonb NOT NULL DEFAULT '{}', -- Store feature access as JSON
  
  -- Important metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  login_count integer NOT NULL DEFAULT 0,
  timezone text DEFAULT 'UTC',
  preferences jsonb NOT NULL DEFAULT '{}', -- User preferences as JSON
  
  -- Admin fields
  is_admin boolean NOT NULL DEFAULT false,
  notes text, -- Admin notes
  blocked_at timestamptz,
  blocked_reason text
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_plan_type ON profiles(plan_type);
CREATE INDEX idx_profiles_plan_status ON profiles(plan_status);
CREATE INDEX idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX idx_profiles_usage_reset_at ON profiles(usage_reset_at);
CREATE INDEX idx_profiles_daily_reset_at ON profiles(daily_reset_at);
CREATE INDEX idx_profiles_last_login ON profiles(last_login_at);

-- Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin policy (if you have admin users)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create function to get plan limits
CREATE OR REPLACE FUNCTION get_plan_limits(plan_name text)
RETURNS jsonb AS $$
BEGIN
  CASE plan_name
    WHEN 'free' THEN
      RETURN jsonb_build_object(
        'monthly_resume_limit', 10,
        'monthly_analysis_limit', 50,
        'monthly_export_limit', 20,
        'storage_limit_mb', 100,
        'daily_api_limit', 1000,
        'features', jsonb_build_object(
          'ai_suggestions', true,
          'export_pdf', true,
          'export_docx', false,
          'custom_templates', false,
          'priority_support', false
        )
      );
    WHEN 'pro' THEN
      RETURN jsonb_build_object(
        'monthly_resume_limit', 100,
        'monthly_analysis_limit', 500,
        'monthly_export_limit', 200,
        'storage_limit_mb', 1000,
        'daily_api_limit', 10000,
        'features', jsonb_build_object(
          'ai_suggestions', true,
          'export_pdf', true,
          'export_docx', true,
          'custom_templates', true,
          'priority_support', false
        )
      );
    WHEN 'enterprise' THEN
      RETURN jsonb_build_object(
        'monthly_resume_limit', 1000,
        'monthly_analysis_limit', 5000,
        'monthly_export_limit', 2000,
        'storage_limit_mb', 10000,
        'daily_api_limit', 100000,
        'features', jsonb_build_object(
          'ai_suggestions', true,
          'export_pdf', true,
          'export_docx', true,
          'custom_templates', true,
          'priority_support', true,
          'team_management', true,
          'sso', true
        )
      );
    WHEN 'unlimited' THEN
      RETURN jsonb_build_object(
        'monthly_resume_limit', -1,
        'monthly_analysis_limit', -1,
        'monthly_export_limit', -1,
        'storage_limit_mb', -1,
        'daily_api_limit', -1,
        'features', jsonb_build_object(
          'ai_suggestions', true,
          'export_pdf', true,
          'export_docx', true,
          'custom_templates', true,
          'priority_support', true,
          'team_management', true,
          'sso', true,
          'white_label', true
        )
      );
    ELSE
      RETURN jsonb_build_object();
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update plan limits
CREATE OR REPLACE FUNCTION update_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  limits jsonb;
BEGIN
  -- Get limits for the new plan
  limits := get_plan_limits(NEW.plan_type);
  
  -- Update limits if plan changed
  IF OLD.plan_type IS DISTINCT FROM NEW.plan_type THEN
    NEW.monthly_resume_limit := (limits->>'monthly_resume_limit')::integer;
    NEW.monthly_analysis_limit := (limits->>'monthly_analysis_limit')::integer;
    NEW.monthly_export_limit := (limits->>'monthly_export_limit')::integer;
    NEW.storage_limit_mb := (limits->>'storage_limit_mb')::integer;
    NEW.daily_api_limit := (limits->>'daily_api_limit')::integer;
    NEW.features := limits->'features';
  END IF;
  
  -- Always update the updated_at timestamp
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for plan updates
CREATE OR REPLACE TRIGGER on_plan_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  WHEN (OLD.plan_type IS DISTINCT FROM NEW.plan_type OR OLD.updated_at IS DISTINCT FROM NEW.updated_at)
  EXECUTE FUNCTION update_plan_limits();

-- Function to reset usage counters
CREATE OR REPLACE FUNCTION reset_usage_counters()
RETURNS void AS $$
BEGIN
  -- Reset monthly counters
  UPDATE profiles
  SET 
    current_resume_count = 0,
    current_analysis_count = 0,
    current_export_count = 0,
    last_usage_reset = usage_reset_at,
    usage_reset_at = date_trunc('month', usage_reset_at + interval '1 month')
  WHERE usage_reset_at <= now();
  
  -- Reset daily counters
  UPDATE profiles
  SET 
    current_daily_api_count = 0,
    last_daily_reset = daily_reset_at,
    daily_reset_at = date_trunc('day', daily_reset_at + interval '1 day')
  WHERE daily_reset_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can perform action
CREATE OR REPLACE FUNCTION can_perform_action(
  user_id uuid,
  action_type text
)
RETURNS boolean AS $$
DECLARE
  profile_record profiles%ROWTYPE;
  can_perform boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO profile_record FROM profiles WHERE id = user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if account is blocked
  IF profile_record.blocked_at IS NOT NULL THEN
    RETURN false;
  END IF;
  
  -- Check plan status
  IF profile_record.plan_status NOT IN ('active', 'trial') THEN
    RETURN false;
  END IF;
  
  -- Check specific action limits
  CASE action_type
    WHEN 'resume_upload' THEN
      can_perform := (
        profile_record.monthly_resume_limit = -1 OR 
        profile_record.current_resume_count < profile_record.monthly_resume_limit
      );
    WHEN 'analysis' THEN
      can_perform := (
        profile_record.monthly_analysis_limit = -1 OR 
        profile_record.current_analysis_count < profile_record.monthly_analysis_limit
      );
    WHEN 'export' THEN
      can_perform := (
        profile_record.monthly_export_limit = -1 OR 
        profile_record.current_export_count < profile_record.monthly_export_limit
      );
    WHEN 'api_call' THEN
      can_perform := (
        profile_record.daily_api_limit = -1 OR 
        profile_record.current_daily_api_count < profile_record.daily_api_limit
      );
    ELSE
      can_perform := true;
  END CASE;
  
  RETURN can_perform;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_usage(
  user_id uuid,
  action_type text
)
RETURNS boolean AS $$
DECLARE
  updated_rows integer;
BEGIN
  -- Check if action is allowed first
  IF NOT can_perform_action(user_id, action_type) THEN
    RETURN false;
  END IF;
  
  -- Increment the appropriate counter
  CASE action_type
    WHEN 'resume_upload' THEN
      UPDATE profiles 
      SET current_resume_count = current_resume_count + 1
      WHERE id = user_id;
    WHEN 'analysis' THEN
      UPDATE profiles 
      SET current_analysis_count = current_analysis_count + 1
      WHERE id = user_id;
    WHEN 'export' THEN
      UPDATE profiles 
      SET current_export_count = current_export_count + 1
      WHERE id = user_id;
    WHEN 'api_call' THEN
      UPDATE profiles 
      SET current_daily_api_count = current_daily_api_count + 1
      WHERE id = user_id;
    ELSE
      RETURN true; -- Unknown action type, assume success
  END CASE;
  
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  limits jsonb;
BEGIN
  -- Get default plan limits
  limits := get_plan_limits('free');
  
  INSERT INTO profiles (
    id, 
    email, 
    name,
    monthly_resume_limit,
    monthly_analysis_limit,
    monthly_export_limit,
    storage_limit_mb,
    daily_api_limit,
    features
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    (limits->>'monthly_resume_limit')::integer,
    (limits->>'monthly_analysis_limit')::integer,
    (limits->>'monthly_export_limit')::integer,
    (limits->>'storage_limit_mb')::integer,
    (limits->>'daily_api_limit')::integer,
    limits->'features'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update login tracking
CREATE OR REPLACE FUNCTION update_login_tracking()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at THEN
    UPDATE profiles 
    SET 
      last_login_at = NEW.last_sign_in_at,
      login_count = login_count + 1
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for login tracking
CREATE OR REPLACE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION update_login_tracking();

-- Create view for user stats (useful for admin dashboard)
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.id,
  p.email,
  p.name,
  p.plan_type,
  p.plan_status,
  p.created_at,
  p.last_login_at,
  p.login_count,
  
  -- Usage percentages
  CASE 
    WHEN p.monthly_resume_limit = -1 THEN 0
    ELSE ROUND((p.current_resume_count::float / p.monthly_resume_limit * 100), 2)
  END as resume_usage_percent,
  
  CASE 
    WHEN p.monthly_analysis_limit = -1 THEN 0
    ELSE ROUND((p.current_analysis_count::float / p.monthly_analysis_limit * 100), 2)
  END as analysis_usage_percent,
  
  CASE 
    WHEN p.monthly_export_limit = -1 THEN 0
    ELSE ROUND((p.current_export_count::float / p.monthly_export_limit * 100), 2)
  END as export_usage_percent,
  
  CASE 
    WHEN p.daily_api_limit = -1 THEN 0
    ELSE ROUND((p.current_daily_api_count::float / p.daily_api_limit * 100), 2)
  END as daily_api_usage_percent,
  
  -- Days until reset
  EXTRACT(days FROM p.usage_reset_at - now()) as days_until_monthly_reset,
  EXTRACT(hours FROM p.daily_reset_at - now()) as hours_until_daily_reset
  
FROM profiles p;

-- Grant appropriate permissions
GRANT SELECT ON user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION can_perform_action(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_plan_limits(text) TO authenticated; 
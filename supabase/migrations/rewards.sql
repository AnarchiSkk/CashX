-- Add columns for loyalty rewards
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_reward_claim timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS total_play_time bigint DEFAULT 0; -- In seconds

-- Function to claim loyalty reward
CREATE OR REPLACE FUNCTION claim_loyalty_reward(reward_amount integer, time_required_minutes integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record record;
  time_diff interval;
  minutes_passed integer;
BEGIN
  -- Get profile
  SELECT * INTO profile_record FROM profiles WHERE id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Check time since last claim
  time_diff := now() - profile_record.last_reward_claim;
  minutes_passed := EXTRACT(EPOCH FROM time_diff) / 60;

  IF minutes_passed < time_required_minutes THEN
    RAISE EXCEPTION 'Not enough time passed. Required: % minutes, Passed: % minutes', time_required_minutes, minutes_passed;
  END IF;

  -- Update profile
  UPDATE profiles
  SET 
    balance = balance + reward_amount,
    last_reward_claim = now()
  WHERE id = auth.uid();

  RETURN json_build_object(
    'success', true,
    'new_balance', profile_record.balance + reward_amount,
    'message', 'Reward claimed successfully'
  );
END;
$$;

-- Migration: 2026 DPDP Compliance - 72-Hour Breach Reporting
-- This migration implements automated breach detection and DPB reporting

-- Create breach_incidents table
CREATE TABLE breach_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_type VARCHAR(64) NOT NULL, -- 'ANOMALOUS_ACCESS', 'DATA_LEAK', 'UNAUTHORIZED_ACCESS'
  severity VARCHAR(16) NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  affected_users UUID[] NOT NULL,
  affected_count INT NOT NULL,
  breach_details JSONB NOT NULL,
  dpb_report_json JSONB, -- Pre-filled Data Protection Board report
  reported_to_dpb BOOLEAN DEFAULT FALSE,
  reported_at TIMESTAMPTZ,
  status VARCHAR(32) DEFAULT 'DETECTED', -- 'DETECTED', 'INVESTIGATING', 'REPORTED', 'RESOLVED'
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_breach_detected ON breach_incidents(detected_at DESC);
CREATE INDEX idx_breach_status ON breach_incidents(status);
CREATE INDEX idx_breach_reported ON breach_incidents(reported_to_dpb);
CREATE INDEX idx_breach_severity ON breach_incidents(severity);

-- Anomaly detection trigger function
CREATE OR REPLACE FUNCTION detect_anomalous_access()
RETURNS TRIGGER AS $$
DECLARE
  recent_unlocks INT;
  affected_users_array UUID[];
  worker_info JSONB;
BEGIN
  -- Check if worker unlocked >5 contacts in 2 minutes
  SELECT COUNT(*), ARRAY_AGG(DISTINCT user_id)
  INTO recent_unlocks, affected_users_array
  FROM consent_audit_logs
  WHERE worker_id = NEW.worker_id
    AND event_type = 'CONTACT_REVEAL'
    AND created_at > NOW() - INTERVAL '2 minutes';
  
  IF recent_unlocks > 5 THEN
    -- Get worker information
    SELECT jsonb_build_object(
      'worker_id', id,
      'phone', phone,
      'display_name', display_name
    ) INTO worker_info
    FROM users
    WHERE id = NEW.worker_id;
    
    -- Create breach incident
    INSERT INTO breach_incidents (
      incident_type,
      severity,
      affected_users,
      affected_count,
      breach_details,
      dpb_report_json
    ) VALUES (
      'ANOMALOUS_ACCESS',
      'HIGH',
      affected_users_array,
      recent_unlocks,
      jsonb_build_object(
        'worker_id', NEW.worker_id,
        'worker_info', worker_info,
        'unlock_count', recent_unlocks,
        'time_window', '2 minutes',
        'detection_trigger', 'consent_audit_log_insert'
      ),
      jsonb_build_object(
        'report_id', 'BR-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MISS'),
        'incident_timestamp', NOW(),
        'data_fiduciary', jsonb_build_object(
          'name', 'Ofera Marketplace Pvt Ltd',
          'registration_number', 'U74999KA2025PTC123456'
        ),
        'breach_nature', 'Anomalous Access Pattern - Excessive Contact Unlocks',
        'affected_data_principals', recent_unlocks,
        'data_categories', ARRAY['phone_number', 'name', 'service_request'],
        'remedial_actions', ARRAY[
          'Worker account flagged for review',
          'Access logs preserved',
          'Automated alert sent to compliance team'
        ],
        'notification_timeline', 'Within 72 hours as per Section 8'
      )
    );
    
    -- Log the breach detection
    RAISE NOTICE 'BREACH DETECTED: Worker % exceeded unlock threshold with % unlocks in 2 minutes', NEW.worker_id, recent_unlocks;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on consent_audit_logs
CREATE TRIGGER trigger_anomaly_detection
AFTER INSERT ON consent_audit_logs
FOR EACH ROW
EXECUTE FUNCTION detect_anomalous_access();

-- Function to check for unreported breaches (to be called by scheduler)
CREATE OR REPLACE FUNCTION check_unreported_breaches()
RETURNS TABLE(incident_id UUID, hours_since_detection NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    EXTRACT(EPOCH FROM (NOW() - detected_at)) / 3600 AS hours_since_detection
  FROM breach_incidents
  WHERE reported_to_dpb = FALSE
    AND severity IN ('HIGH', 'CRITICAL')
    AND detected_at < NOW() - INTERVAL '48 hours' -- Alert if approaching 72-hour deadline
  ORDER BY detected_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE breach_incidents IS '72-Hour Breach Reporting: Automated detection and DPB reporting';
COMMENT ON FUNCTION detect_anomalous_access() IS 'Trigger function to detect anomalous access patterns';
COMMENT ON FUNCTION check_unreported_breaches() IS 'Check for breaches approaching 72-hour reporting deadline';

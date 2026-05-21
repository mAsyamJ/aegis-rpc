-- plan.md §13 — audit log (run in Supabase SQL editor or via CLI)
CREATE TABLE IF NOT EXISTS aegis_events (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  chain_id INTEGER NOT NULL,
  method TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  value_wei TEXT NOT NULL,
  selector TEXT,
  decoded_function TEXT,
  decoded_args JSONB,
  calldata_preview TEXT,
  use_case TEXT,
  is_unknown_selector BOOLEAN NOT NULL DEFAULT false,
  policy_id TEXT,
  verdict TEXT NOT NULL,
  reason_code TEXT NOT NULL,
  signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  needs_ai_analysis BOOLEAN NOT NULL DEFAULT false,
  broadcasted BOOLEAN NOT NULL DEFAULT false,
  tx_hash TEXT,
  serialized_transaction TEXT,
  ai_memo TEXT,
  ai_analysis JSONB,
  memo_status TEXT NOT NULL DEFAULT 'pending',
  on_chain_policy_hash TEXT,
  unknown_selector_guess TEXT,
  risk_summary TEXT,
  primary_concern TEXT,
  ai_generated_at TIMESTAMPTZ,
  ai_confidence TEXT,
  latency_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_aegis_events_created_at ON aegis_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aegis_events_verdict ON aegis_events (verdict);
CREATE INDEX IF NOT EXISTS idx_aegis_events_request_id ON aegis_events (request_id);

CREATE TABLE IF NOT EXISTS aegis_policies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'enforce',
  chain_id INTEGER NOT NULL DEFAULT 84532,
  config JSONB NOT NULL,
  on_chain_policy_id TEXT,
  on_chain_policy_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hackathon MVP: allow server writes with publishable/anon key (tighten RLS post-demo)
ALTER TABLE aegis_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE aegis_policies DISABLE ROW LEVEL SECURITY;

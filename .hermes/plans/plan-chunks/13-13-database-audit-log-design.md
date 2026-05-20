## 13. Database / Audit Log Design

```sql
-- aegis_events: updated with AI analysis columns
CREATE TABLE IF NOT EXISTS aegis_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  chain_id INTEGER NOT NULL,
  method TEXT NOT NULL,
  from_address TEXT,
  to_address TEXT,
  value_wei TEXT,
  value_usd NUMERIC,
  selector TEXT,
  decoded_function TEXT,
  decoded_args JSONB,
  use_case TEXT,
  is_unknown_selector BOOLEAN DEFAULT false,
  policy_id TEXT,
  policy_template TEXT,
  on_chain_policy_hash TEXT,
  verdict TEXT NOT NULL,
  reason_code TEXT,
  signals JSONB,
  needs_ai_analysis BOOLEAN DEFAULT false,
  broadcasted BOOLEAN DEFAULT false,
  tx_hash TEXT,
  -- AI analysis fields (populated async after response is returned)
  ai_memo TEXT,
  ai_unknown_selector_guess TEXT,
  ai_risk_summary TEXT,
  ai_pre_signing_assist TEXT,
  ai_confidence TEXT,
  ai_generated_at TIMESTAMPTZ,
  latency_ms INTEGER
);

-- aegis_policies
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

CREATE INDEX idx_aegis_events_created_at ON aegis_events(created_at DESC);
CREATE INDEX idx_aegis_events_verdict ON aegis_events(verdict);
CREATE INDEX idx_aegis_events_request_id ON aegis_events(request_id);
```

---

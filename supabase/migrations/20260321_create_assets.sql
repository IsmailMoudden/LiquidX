-- LiquidX — assets table
-- Each row is one tokenized real-world asset registered by a verified issuer.

create table if not exists public.assets (
  id                    text primary key,
  user_id               text not null,

  -- Core info
  name                  text not null,
  category              text not null,
  description           text,
  long_description      text,
  location              text,
  image_url             text,

  -- Tokenization params
  total_value           numeric not null,
  token_supply          numeric not null,
  token_price           numeric not null,
  projected_yield       numeric not null,
  liquidity_score       integer,
  min_investment        numeric default 100,
  sources               text[] default '{}',

  -- Funding / Escrow
  funding_target        numeric,
  funding_deadline      timestamptz,
  funding_status        text default 'open',
  amount_raised         numeric default 0,
  investor_count        integer default 0,
  validator_id          text,
  compliance_approved   boolean default false,

  -- MPT (XLS-33)
  mpt_issuance_id       text,

  -- Identity (XRP DID)
  issuer_did            text,
  issuer_verified       boolean default false,

  -- Legal / Contract
  legal_declaration_hash  text,    -- SHA-256 of the signed collateral contract JSON
  contract_tx_hash        text,    -- XRPL tx hash that anchors the signature on-chain
  ownership_proof_hash    text,    -- SHA-256 of the uploaded ownership document

  -- Proof of ownership doc metadata
  doc_type              text,      -- e.g. "Title Deed", "Certificate of Authenticity"
  doc_issued_by         text,      -- e.g. "Dubai Land Department"
  doc_date              date,      -- Date the document was issued

  -- Status
  verification_status   text default 'pending',  -- pending | verified | rejected

  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Indexes
create index if not exists assets_user_id_idx        on public.assets(user_id);
create index if not exists assets_funding_status_idx on public.assets(funding_status);
create index if not exists assets_category_idx       on public.assets(category);

-- Enable RLS
alter table public.assets enable row level security;

-- Policy: anyone can read open/funded assets
create policy "assets_public_read" on public.assets
  for select using (funding_status in ('open', 'funded', 'released'));

-- Policy: issuer can read/write their own assets
create policy "assets_owner_all" on public.assets
  for all using (user_id = auth.uid()::text);

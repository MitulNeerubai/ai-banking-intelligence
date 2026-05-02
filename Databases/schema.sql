-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.budgets (
  id integer NOT NULL DEFAULT nextval('budgets_id_seq'::regclass),
  user_id integer NOT NULL,
  category character varying NOT NULL,
  limit_amount numeric NOT NULL,
  month integer NOT NULL CHECK (month >= 1 AND month <= 12),
  year integer NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.cashflow_forecasts (
  id integer NOT NULL DEFAULT nextval('cashflow_forecasts_id_seq'::regclass),
  user_id integer NOT NULL,
  account_id text NOT NULL DEFAULT 'all'::text,
  as_of_date date NOT NULL,
  horizon_days integer NOT NULL,
  starting_balance numeric NOT NULL DEFAULT 0,
  projected_end_balance numeric NOT NULL DEFAULT 0,
  min_projected_balance numeric NOT NULL DEFAULT 0,
  risk_score numeric NOT NULL DEFAULT 0,
  projected_daily_balances jsonb NOT NULL DEFAULT '[]'::jsonb,
  drivers_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  explanation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT cashflow_forecasts_pkey PRIMARY KEY (id),
  CONSTRAINT cashflow_forecasts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.fraud_logs (
  id integer NOT NULL DEFAULT nextval('fraud_logs_id_seq'::regclass),
  user_id integer NOT NULL,
  transaction_id integer NOT NULL,
  rule_triggered character varying NOT NULL,
  flagged_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fraud_logs_pkey PRIMARY KEY (id),
  CONSTRAINT fraud_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fraud_logs_transaction_id_fkey FOREIGN KEY (transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.health_scores (
  id integer NOT NULL DEFAULT nextval('health_scores_id_seq'::regclass),
  user_id integer NOT NULL,
  account_id text NOT NULL DEFAULT 'all'::text,
  as_of_date date NOT NULL,
  analysis_window_days integer NOT NULL DEFAULT 90,
  health_score integer NOT NULL DEFAULT 0,
  savings_ratio numeric NOT NULL DEFAULT 0,
  volatility_score numeric NOT NULL DEFAULT 0,
  recurring_burden numeric NOT NULL DEFAULT 0,
  cash_buffer_days numeric NOT NULL DEFAULT 0,
  component_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  explanation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT health_scores_pkey PRIMARY KEY (id),
  CONSTRAINT health_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.plaid_items (
  id integer NOT NULL DEFAULT nextval('plaid_items_id_seq'::regclass),
  user_id integer NOT NULL,
  access_token text NOT NULL,
  item_id text NOT NULL UNIQUE,
  institution_id text,
  institution_name text,
  cursor text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT plaid_items_pkey PRIMARY KEY (id),
  CONSTRAINT plaid_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.recurring_events (
  id integer NOT NULL DEFAULT nextval('recurring_events_id_seq'::regclass),
  recurring_id integer NOT NULL,
  transaction_id integer,
  date date NOT NULL,
  amount numeric NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recurring_events_pkey PRIMARY KEY (id),
  CONSTRAINT recurring_events_recurring_id_fkey FOREIGN KEY (recurring_id) REFERENCES public.recurring_merchants(id)
);
CREATE TABLE public.recurring_merchants (
  id integer NOT NULL DEFAULT nextval('recurring_merchants_id_seq'::regclass),
  user_id integer NOT NULL,
  account_id text NOT NULL DEFAULT 'all'::text,
  merchant_key text NOT NULL,
  merchant_display_name text NOT NULL,
  cadence text NOT NULL DEFAULT 'unknown'::text,
  avg_amount numeric NOT NULL DEFAULT 0,
  amount_stddev numeric NOT NULL DEFAULT 0,
  amount_tolerance numeric NOT NULL DEFAULT 0,
  last_charge_date date,
  next_expected_date date,
  confidence_score numeric NOT NULL DEFAULT 0,
  sample_size integer NOT NULL DEFAULT 0,
  last_n_transactions jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recurring_merchants_pkey PRIMARY KEY (id),
  CONSTRAINT recurring_merchants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.recurring_transactions (
  id integer NOT NULL DEFAULT nextval('recurring_transactions_id_seq'::regclass),
  user_id integer NOT NULL,
  merchant character varying NOT NULL,
  average_amount numeric NOT NULL,
  frequency_days integer NOT NULL,
  last_seen date NOT NULL,
  annual_estimate numeric,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT recurring_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT recurring_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.savings (
  id integer NOT NULL DEFAULT nextval('savings_id_seq'::regclass),
  user_id integer NOT NULL,
  source_transaction_id integer NOT NULL,
  rounded_amount numeric NOT NULL,
  saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT savings_pkey PRIMARY KEY (id),
  CONSTRAINT savings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT savings_source_transaction_id_fkey FOREIGN KEY (source_transaction_id) REFERENCES public.transactions(id)
);
CREATE TABLE public.time_range_reports (
  id integer NOT NULL DEFAULT nextval('time_range_reports_id_seq'::regclass),
  user_id integer NOT NULL,
  account_id text NOT NULL DEFAULT 'all'::text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  granularity text NOT NULL DEFAULT 'week'::text,
  total_spent numeric DEFAULT 0,
  total_income numeric DEFAULT 0,
  net_change numeric DEFAULT 0,
  top_merchants jsonb DEFAULT '[]'::jsonb,
  top_categories jsonb DEFAULT '[]'::jsonb,
  volatility_score numeric DEFAULT 0,
  explanation_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  period_change numeric DEFAULT 0,
  CONSTRAINT time_range_reports_pkey PRIMARY KEY (id),
  CONSTRAINT time_range_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.transactions (
  id integer NOT NULL DEFAULT nextval('transactions_id_seq'::regclass),
  user_id integer NOT NULL,
  amount numeric NOT NULL,
  category character varying,
  description text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  plaid_transaction_id text UNIQUE,
  source text DEFAULT 'manual'::text,
  plaid_account_id character varying,
  institution_name character varying,
  account_name character varying,
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.users (
  id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.weekly_reports (
  id integer NOT NULL DEFAULT nextval('weekly_reports_id_seq'::regclass),
  user_id integer NOT NULL,
  account_id text NOT NULL DEFAULT 'all'::text,
  week_start date NOT NULL,
  week_end date NOT NULL,
  total_spent numeric DEFAULT 0,
  total_income numeric DEFAULT 0,
  net_change numeric DEFAULT 0,
  top_merchants jsonb DEFAULT '[]'::jsonb,
  top_categories jsonb DEFAULT '[]'::jsonb,
  week_over_week_change numeric,
  volatility_score numeric DEFAULT 0,
  explanation_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT weekly_reports_pkey PRIMARY KEY (id),
  CONSTRAINT weekly_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Track Razorpay order id on payment rows (create-order → confirm / webhook).
alter table public.payments
  add column if not exists provider_order_id text;

create index if not exists idx_payments_provider_order_id
  on public.payments (provider_order_id);

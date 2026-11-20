-- Admin: tayyor (statik) testlar bo'yicha natijalarni tez olish.
CREATE INDEX IF NOT EXISTS results_test_idx ON results (test_id, created_at DESC) WHERE test_id IS NOT NULL;

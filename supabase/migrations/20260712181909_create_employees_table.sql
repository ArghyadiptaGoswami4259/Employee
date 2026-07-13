/*
# Create employees table

## Summary
Sets up the core Employee Management System (EMS) data store.

## New Tables
- `employees`
  - `id` (uuid, primary key)
  - `first_name` (text, not null)
  - `last_name` (text, not null)
  - `email` (text, unique, not null)
  - `phone` (text)
  - `department` (text, not null)
  - `position` (text, not null)
  - `salary` (numeric)
  - `hire_date` (date, not null)
  - `status` (text, default 'active')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

## Security
- RLS enabled, anon + authenticated can perform full CRUD (single-tenant, no auth required).

## Notes
- `status` is constrained to 'active' or 'inactive'.
- Indexes on department, status, last_name for fast filtering/sorting.
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  department text NOT NULL,
  position text NOT NULL,
  salary numeric(12, 2),
  hire_date date NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS employees_department_idx ON employees(department);
CREATE INDEX IF NOT EXISTS employees_status_idx ON employees(status);
CREATE INDEX IF NOT EXISTS employees_last_name_idx ON employees(last_name);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_employees" ON employees;
CREATE POLICY "anon_select_employees" ON employees FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_employees" ON employees;
CREATE POLICY "anon_update_employees" ON employees FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_employees" ON employees;
CREATE POLICY "anon_delete_employees" ON employees FOR DELETE
  TO anon, authenticated USING (true);

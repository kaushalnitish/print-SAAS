# PrintFlow Cloud - Supabase Configuration

This directory contains database rules, triggers, and configurations for integrating Supabase into the application.

## Database Tables

### 1. `profiles`
Holds the user profiles of the shop owners.
* Fields: `id` (uuid, primary key), `name` (text), `email` (text), `phone` (text), `created_at` (timestamp)

### 2. `shops`
Holds the print shop and branch structures.
* Fields: `id` (uuid, primary key), `shop_id` (text, unique), `shop_slug` (text, unique), `shop_name` (text), `owner_id` (uuid, references profiles), `phone` (text), `address` (text), `subscription` (text), `pairing_key` (text), `printer_status` (text), `agent_status` (text), `created_at` (timestamp)

### 3. `print_jobs`
Holds files and parameters for print requests.
* Fields: `id` (uuid, primary key), `job_id` (text, unique), `token` (text), `file_name` (text), `file_size` (text), `pages` (integer), `copies` (integer), `color_mode` (text), `paper_size` (text), `side_mode` (text), `status` (text), `shop_id` (uuid, references shops), `created_at` (timestamp)

## Setup Instructions

1. Copy the contents of `/supabase-schema.sql` at the root of the project.
2. Go to your **Supabase Dashboard** -> **SQL Editor**.
3. Create a new query, paste the schema script, and click **Run**.
4. Configure your hosting environment secrets with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

# Database Structure

## Overview

This document describes the database structure for the Resco AI application built with Supabase.

## Tables

### 1. profiles

Stores user profile information, automatically created when a user signs up.

| Column     | Type        | Description                     | Constraints                                |
| ---------- | ----------- | ------------------------------- | ------------------------------------------ |
| id         | UUID        | User ID (matches auth.users.id) | PRIMARY KEY, REFERENCES auth.users(id)     |
| email      | TEXT        | User's email address            | UNIQUE, NOT NULL                           |
| name       | TEXT        | User's display name             |                                            |
| role       | TEXT        | User role (user/admin)          | DEFAULT 'user', CHECK IN ('user', 'admin') |
| created_at | TIMESTAMPTZ | Creation timestamp              | DEFAULT now()                              |
| updated_at | TIMESTAMPTZ | Last update timestamp           | DEFAULT now()                              |

**Indexes:**

- idx_profiles_email ON email

**RLS Policies:**

- Users can view their own profile
- Users can update their own profile
- Service role can insert profiles (via trigger)

**Triggers:**

- on_auth_user_created: Automatically creates profile on user signup
- update_profiles_updated_at: Updates updated_at timestamp

### 2. resumes

Stores user resumes and their content.

| Column     | Type        | Description                       | Constraints                            |
| ---------- | ----------- | --------------------------------- | -------------------------------------- |
| id         | UUID        | Resume ID                         | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id    | UUID        | Owner's user ID                   | NOT NULL, REFERENCES auth.users(id)    |
| name       | TEXT        | Resume name/title                 | NOT NULL                               |
| content    | JSONB       | Resume content in JSON format     |                                        |
| template   | TEXT        | Template identifier               | DEFAULT 'default'                      |
| is_active  | BOOLEAN     | Whether this is the active resume | DEFAULT false                          |
| created_at | TIMESTAMPTZ | Creation timestamp                | DEFAULT now()                          |
| updated_at | TIMESTAMPTZ | Last update timestamp             | DEFAULT now()                          |

**Indexes:**

- idx_resumes_user_id ON user_id
- idx_resumes_is_active ON is_active

**RLS Policies:**

- Users can view their own resumes
- Users can create their own resumes
- Users can update their own resumes
- Users can delete their own resumes

**Triggers:**

- update_resumes_updated_at: Updates updated_at timestamp

### 3. user_activity

Tracks user activities and actions within the application.

| Column        | Type        | Description                   | Constraints                            |
| ------------- | ----------- | ----------------------------- | -------------------------------------- |
| id            | UUID        | Activity ID                   | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id       | UUID        | User who performed the action | NOT NULL, REFERENCES auth.users(id)    |
| action        | TEXT        | Action performed              | NOT NULL                               |
| resource_type | TEXT        | Type of resource affected     |                                        |
| resource_id   | UUID        | ID of the affected resource   |                                        |
| metadata      | JSONB       | Additional activity metadata  | DEFAULT '{}'                           |
| created_at    | TIMESTAMPTZ | Activity timestamp            | DEFAULT now()                          |

**Indexes:**

- idx_user_activity_user_id ON user_id
- idx_user_activity_created_at ON created_at DESC
- idx_user_activity_action ON action

**RLS Policies:**

- Users can view their own activity
- Users can insert their own activity

### 4. user_sessions

Tracks user login sessions.

| Column           | Type        | Description                       | Constraints                            |
| ---------------- | ----------- | --------------------------------- | -------------------------------------- |
| id               | UUID        | Session ID                        | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id          | UUID        | User ID                           | NOT NULL, REFERENCES auth.users(id)    |
| session_token    | TEXT        | Unique session token              | UNIQUE, NOT NULL                       |
| ip_address       | INET        | User's IP address                 |                                        |
| user_agent       | TEXT        | User's browser/device info        |                                        |
| started_at       | TIMESTAMPTZ | Session start time                | DEFAULT now()                          |
| ended_at         | TIMESTAMPTZ | Session end time (null if active) |                                        |
| last_activity_at | TIMESTAMPTZ | Last activity timestamp           | DEFAULT now()                          |

**Indexes:**

- idx_user_sessions_user_id ON user_id
- idx_user_sessions_token ON session_token
- idx_user_sessions_active ON ended_at WHERE ended_at IS NULL

**RLS Policies:**

- Users can view their own sessions
- Users can update their own sessions

### 5. feedback

Stores user feedback and support requests.

| Column     | Type        | Description                 | Constraints                                                            |
| ---------- | ----------- | --------------------------- | ---------------------------------------------------------------------- |
| id         | UUID        | Feedback ID                 | PRIMARY KEY, DEFAULT gen_random_uuid()                                 |
| user_id    | UUID        | User who submitted feedback | REFERENCES auth.users(id) ON DELETE SET NULL                           |
| type       | TEXT        | Feedback type               | NOT NULL, CHECK IN ('bug', 'feature', 'general')                       |
| subject    | TEXT        | Feedback subject            | NOT NULL                                                               |
| message    | TEXT        | Feedback message            | NOT NULL                                                               |
| status     | TEXT        | Feedback status             | DEFAULT 'open', CHECK IN ('open', 'in_progress', 'resolved', 'closed') |
| created_at | TIMESTAMPTZ | Creation timestamp          | DEFAULT now()                                                          |
| updated_at | TIMESTAMPTZ | Last update timestamp       | DEFAULT now()                                                          |

**RLS Policies:**

- Anyone can create feedback
- Users can view their own feedback

**Triggers:**

- update_feedback_updated_at: Updates updated_at timestamp

## Functions

### handle_new_user()

Automatically creates a profile entry when a new user signs up.

- Trigger: on_auth_user_created
- Security: SECURITY DEFINER
- Search Path: public, pg_temp

### handle_updated_at()

Updates the updated_at timestamp before any row update.

- Used by multiple tables
- Search Path: public, pg_temp

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following general patterns:

- Users can only access their own data
- Service role has elevated permissions for system operations
- Public access is restricted

### Authentication Flow

1. User signs up via auth.users (Supabase Auth)
2. Trigger creates profile in public.profiles
3. User can then create resumes, activities are tracked
4. All operations are secured by RLS policies

## Usage Notes

### Profile Creation

Profiles are automatically created via database trigger when a user signs up. The trigger extracts the name from user metadata or uses the email prefix as a fallback.

### Activity Tracking

User activities should be logged to user_activity table for analytics and audit purposes.

### Session Management

Sessions can be tracked in user_sessions table for security and analytics.

### Feedback System

The feedback table allows both authenticated and anonymous feedback submission.

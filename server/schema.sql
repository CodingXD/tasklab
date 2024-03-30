CREATE TABLE IF NOT EXISTS user (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    first_name varchar(200) NOT NULL,
    last_name varchar(200) NOT NULL,
    email varchar(320) NOT NULL UNIQUE,
    password varchar(500) NOT NULL,
    role varchar(30) DEFAULT 'member' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL,
)

CREATE TABLE IF NOT EXISTS task (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    title varchar(200) NOT NULL,
    description text,
    status varchar(15) DEFAULT 'todo' NOT NULL,
    due_date date,
    created_by uuid REFERENCES user(id) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL,
)

CREATE TABLE IF NOT EXISTS collaborators (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    task_id uuid REFERENCES task(id) NOT NULL,
    user_id uuid REFERENCES user(id) NOT NULL,
)
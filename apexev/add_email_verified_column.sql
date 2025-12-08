USE apexev;
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT TRUE;
UPDATE users SET email_verified = TRUE WHERE email_verified IS NULL OR email_verified = FALSE;
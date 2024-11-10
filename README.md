# Security Vulnerabilities Demo

This web application demonstrates two security vulnerabilities: SQL Injection and Cross-Site Request Forgery (CSRF). The application allows toggling of each vulnerability through the user interface to enable or disable the specific vulnerability.

## Features
- **SQL Injection**: Allows testing of SQL Injection attacks by toggling the vulnerability on or off.
- **CSRF**: Enables or disables CSRF protection to simulate successful or unsuccessful attacks.

## How to Use
1. **SQL Injection**:
   - Navigate to the SQL Injection page and input a username.
   - Toggle the vulnerability to enable or disable SQL Injection attacks.
   - Test by entering SQL injection payloads (e.g., `' OR '1'='1`).
   
2. **CSRF**:
   - Navigate to the CSRF page to update user status.
   - Enable or disable the vulnerability using the checkbox.
   - Use the CSRF Attack page to perform a simulated CSRF attack.

## Testing Each Vulnerability
1. **SQL Injection**:
   - Enable SQL Injection vulnerability and try a SQL injection payload.
   - If the vulnerability is enabled, unauthorized access should be granted.
   - If disabled, the application should block unauthorized access.

2. **CSRF**:
   - Enable CSRF vulnerability on the CSRF page.
   - Attempt an attack via the CSRF Attack page.
   - If the vulnerability is enabled, the attack should succeed.
   - If disabled, the attack should be blocked.

## Deployment
Instructions for deploying to a cloud environment like Render.

### Running Locally
1. Clone the repository.
2. Install dependencies: `npm install`
3. Start the application: `node app.js`
4. Access the application on `http://localhost:3000`.


# Basic Testing Results (Milestone 2)

## Test Scope
- File storage and retrieval
- Google OAuth and JWT issuance
- Auth middleware and RBAC permissions
- Centralized error responses
- Security controls (Helmet + validation)

## Environment
- Date: __________________
- Tester: ________________
- Backend URL: __________________
- Frontend URL: __________________

## Feature-Specific Test Matrix

| Feature | Test Case | Expected Result | Status | Evidence |
|---|---|---|---|---|
| File Upload | Upload valid PNG/JPG/WEBP <= 2MB | 200 response, profile image updated | [ ] Pass / [ ] Fail | Screenshot / log |
| File Upload | Upload invalid MIME type | 400 validation error | [ ] Pass / [ ] Fail | Screenshot / log |
| File Upload | Upload file >2MB | 400 size error | [ ] Pass / [ ] Fail | Screenshot / log |
| File Retrieval | Fetch `/api/auth/me` after upload | Signed URL returned in `profileImage` | [ ] Pass / [ ] Fail | Screenshot / log |
| Authentication | Register with valid inputs | 201 response, JWT returned | [ ] Pass / [ ] Fail | Screenshot / log |
| Authentication | Login with invalid password | 400 `Invalid credentials` | [ ] Pass / [ ] Fail | Screenshot / log |
| OAuth | Login with Google | Redirect then JWT stored and dashboard access | [ ] Pass / [ ] Fail | Screenshot / log |
| Token Validation | Call protected route without token | 401 unauthorized | [ ] Pass / [ ] Fail | Screenshot / log |
| RBAC | Call `GET /api/auth/users` as non-admin | 403 forbidden | [ ] Pass / [ ] Fail | Screenshot / log |
| RBAC | Call `GET /api/auth/users` as admin | 200 with user list | [ ] Pass / [ ] Fail | Screenshot / log |
| Error Handling | Call non-existent route | 404 standardized error | [ ] Pass / [ ] Fail | Screenshot / log |
| Validation | Submit malformed payload to create transaction | 400 validation error details | [ ] Pass / [ ] Fail | Screenshot / log |
| Security Headers | Inspect response headers | Helmet headers present | [ ] Pass / [ ] Fail | Screenshot / log |

## Command Examples

```bash
# Protected route without token (should return 401)
curl -i http://localhost:5000/api/transactions/summary

# Non-admin role check (should return 403 when token belongs to regular user)
curl -i -H "Authorization: Bearer <USER_TOKEN>" http://localhost:5000/api/auth/users

# Admin role check (should return 200 when token belongs to admin)
curl -i -H "Authorization: Bearer <ADMIN_TOKEN>" http://localhost:5000/api/auth/users
```

## Summary
- Passed: _____
- Failed: _____
- Blocked: _____

## Attached Evidence
- Store screenshots in `Screenshots/`.
- Include API logs or terminal captures for failed and successful scenarios.

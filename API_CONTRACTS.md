# InsureEase — Backend API Specification & Contract

This document outlines the REST API contracts required by the InsureEase mobile application. All endpoints adhere to standard REST conventions, JSON request/response formats, and token-based authentication via HTTP Bearer headers.

---

## 1. Global Standards

- **Base URL:** `https://api.insureease.in/v1`
- **Security:** `Authorization: Bearer <JWT_ACCESS_TOKEN>`
- **Content-Type:** `application/json`
- **Standard Success Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operation successful",
    "timestamp": "2026-10-16T12:00:00Z"
  }
  ```
- **Standard Error Response Format:**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_FAILED",
      "message": "Invalid Indian PAN number format",
      "details": [{ "field": "panNumber", "issue": "Must match regex [A-Z]{5}[0-9]{4}[A-Z]{1}" }]
    },
    "timestamp": "2026-10-16T12:00:00Z"
  }
  ```

---

## 2. Authentication & Account Management

### 2.1 Request OTP / Initiate Login
- **Endpoint:** `POST /auth/request-otp`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "identifier": "9876543210", // 10-digit Indian Mobile or valid Email
    "type": "LOGIN" // LOGIN | REGISTER | FORGOT_PASSWORD
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "otpSessionId": "otp_sess_9f81a7b",
      "expiresInSeconds": 300,
      "resendAvailableInSeconds": 30
    }
  }
  ```

### 2.2 Verify OTP & Issue Token
- **Endpoint:** `POST /auth/verify-otp`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "identifier": "9876543210",
    "otp": "123456",
    "otpSessionId": "otp_sess_9f81a7b"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "d8f1e2c3...",
      "user": {
        "id": "usr_998231",
        "fullName": "Rahul Sharma",
        "phone": "9876543210",
        "email": "rahul.sharma@example.com",
        "isKycVerified": true
      }
    }
  }
  ```

### 2.3 Create Account
- **Endpoint:** `POST /auth/register`
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "fullName": "Rahul Sharma",
    "phone": "9876543210",
    "email": "rahul.sharma@example.com",
    "termsConsent": true
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "userId": "usr_998231",
      "otpSessionId": "otp_sess_112233"
    }
  }
  ```

---

## 3. Product Discovery & Comparison

### 3.1 List Insurance Categories
- **Endpoint:** `GET /categories`
- **Auth Required:** No (Guest allowed)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "health",
        "name": "Health Insurance",
        "tagline": "Comprehensive hospitalization and medical cover",
        "iconName": "shield-plus",
        "popular": true
      }
    ]
  }
  ```

### 3.2 List Insurance Plans
- **Endpoint:** `GET /plans`
- **Query Params:**
  - `categoryId`: (Optional) e.g. `health`, `term`, `travel`
  - `query`: (Optional) search keyword
  - `minSumInsured`: (Optional) number
  - `maxBudget`: (Optional) number
- **Auth Required:** No (Guest allowed)
- **Response (200 OK):** Returns array of `InsurancePlan` objects.

### 3.3 Get Plan Details
- **Endpoint:** `GET /plans/{planId}`
- **Auth Required:** No (Guest allowed)
- **Response (200 OK):** Comprehensive plan schema including waiting periods, room rent terms, cashless network size, exclusions, and IRDAI UIN.

### 3.4 Multi-Plan Comparison
- **Endpoint:** `POST /plans/compare`
- **Auth Required:** No (Guest allowed)
- **Request Body:**
  ```json
  {
    "planIds": ["care-supreme", "hdfc-optima-secure", "star-comprehensive"],
    "categoryId": "health"
  }
  ```
- **Response (200 OK):** Side-by-side feature matrix.

---

## 4. Indicative Quotes & Actuarial Calculator

### 4.1 Calculate Indicative Quote
- **Endpoint:** `POST /quotes/indicative`
- **Auth Required:** No (Guest allowed)
- **Request Body:**
  ```json
  {
    "categoryId": "health",
    "age": 29,
    "pincode": "110001",
    "sumInsured": 1000000,
    "tobaccoUser": false,
    "cityTier": 1
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "planId": "care-supreme",
        "planName": "Care Supreme",
        "providerName": "Care Health Insurance",
        "estimatedAnnualPremium": 8500,
        "gstAmount": 1530,
        "totalAnnualPayable": 10030,
        "estimatedMonthlyPremium": 836,
        "sumInsured": 1000000,
        "isIndicative": true,
        "disclaimer": "Indicative estimate under IRDAI Sec 45 rules. Final quote subject to medical underwriting."
      }
    ]
  }
  ```

---

## 5. Applications & Policy Servicing (Protected)

### 5.1 Submit Insurance Application
- **Endpoint:** `POST /applications`
- **Auth Required:** Yes (Bearer Token)
- **Request Body:**
  ```json
  {
    "planId": "care-supreme",
    "sumInsured": 1000000,
    "tenureYears": 1,
    "applicant": {
      "fullName": "Rahul Sharma",
      "dob": "1996-05-15",
      "gender": "male",
      "panNumber": "ABCDE1234F",
      "pincode": "110001",
      "city": "New Delhi",
      "state": "Delhi"
    },
    "medicalDeclaration": {
      "hasPreExistingDisease": false,
      "tobaccoConsumer": false,
      "priorHospitalization": false
    },
    "nominee": {
      "fullName": "Pooja Sharma",
      "relationship": "Spouse",
      "age": 28
    }
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "applicationId": "APP-2026-98124",
      "status": "UNDER_REVIEW",
      "submittedAt": "2026-10-16T12:00:00Z"
    }
  }
  ```

### 5.2 List User Policies
- **Endpoint:** `GET /policies`
- **Auth Required:** Yes (Bearer Token)
- **Response (200 OK):** Returns active, grace period, and expired policies for the logged-in user.

### 5.3 Submit Renewal Request
- **Endpoint:** `POST /policies/{policyId}/renew`
- **Auth Required:** Yes (Bearer Token)
- **Request Body:**
  ```json
  {
    "existingPolicyNumber": "POL-9918234-HL",
    "insurer": "Care Health Insurance",
    "expiryDate": "2026-11-30",
    "optNoClaimBonus": true
  }
  ```

### 5.4 Submit Portability Request
- **Endpoint:** `POST /policies/port`
- **Auth Required:** Yes (Bearer Token)
- **Request Body:**
  ```json
  {
    "currentInsurer": "Star Health",
    "targetInsurer": "HDFC ERGO",
    "currentPolicyNumber": "SH-1029384",
    "cumulativeBonusPercentage": 25,
    "claimsHistoryInLast3Years": false,
    "portabilityReason": "Wider cashless network"
  }
  ```

# Authentication

## Requirements

**System**: Express.js + TypeScript API with 3 authentication types:
1. **Web App Authentication**: Strava OAuth + HttpOnly cookies, full REST API access
2. **Personal Access Tokens (PATs)**: API key management, read-only access via Bearer headers  
3. **MCP Client Authentication**: OAuth 2.1 compliant with PKCE, MCP protocol access

## Usage Scenarios

### Web App Authentication Scenarios

**Scenario 1: Web App First-Time Login (No Account)**
```
User → Web App (click login) → Strava OAuth → Web App (authenticated)
```
- User clicks login in web app
- Redirected to Strava for authorization
- Strava redirects back to web app
- API exchanges Strava tokens and issues session cookies
- **Account created** in system using Strava user ID
- **Result**: Web app authenticated with cookies

**Scenario 2: Web App Login (Existing Account, Not Logged In)**
```
User → Web App (click login) → Strava OAuth → Web App (authenticated)
```
- User clicks login in web app
- Redirected to Strava for authorization
- Strava redirects back to web app
- API finds existing account by Strava user ID
- API exchanges Strava tokens and issues session cookies
- **Result**: Web app authenticated with cookies

**Scenario 3: Web App Login (Existing Account, Already Logged In)**
```
User → Web App (already authenticated) → No action needed
```
- User accesses web app with valid authentication cookies
- API validates existing session
- **Result**: User remains authenticated, no Strava interaction

### MCP Client Authentication Scenarios

**Scenario 4: MCP Client First-Time Connection (No Account)**
```
User → MCP Client (connect) → Strava OAuth → MCP Client (authenticated)
```
- User clicks to connect MCP server in MCP client
- Server redirects to Strava for authorization
- After Strava auth, redirected back to MCP server, then to MCP client
- **Account created** in system using Strava user ID
- **Result**: MCP client receives OAuth 2.1 tokens

**Scenario 5: MCP Client Connection (Existing Account, Not Logged In)**
```
User → MCP Client (connect) → Strava OAuth → MCP Client (authenticated)
```
- User clicks to connect MCP server in MCP client
- Server redirects to Strava for authorization
- After Strava auth, redirected back to MCP server
- API finds existing account by Strava user ID
- Server generates OAuth authorization code, redirects to MCP client
- **Result**: MCP client receives OAuth 2.1 tokens

**Scenario 6: MCP Client Connection (Existing Account, Already Logged In)**
```
User → MCP Client (connect) → MCP Server (skip Strava) → MCP Client (authenticated)
```
- User clicks to connect MCP server in MCP client
- Server detects existing Strava authorization (via cookie)
- **Skips Strava screen entirely**
- Proceeds directly to MCP OAuth authorization
- **Result**: MCP client receives OAuth 2.1 tokens

### PAT Management Scenario

**Scenario 7: PAT Creation and Usage**
```
User → Web App (already logged in) → Create PAT → Use in API clients
```
- User must first be logged in to web app (via Scenarios 1-3)
- Creates Personal Access Token through web interface
- PAT linked to internal user ID (not Strava user ID)
- **Result**: PAT can be used for read-only API access via `Authorization: Bearer pat_xyz`

## Key Insights from Scenarios

**Shared Strava Authentication State**: Scenarios 5 and 6 show that Strava authentication state is shared between web app and MCP flows - if user is already authenticated via web app, MCP flow can skip Strava authorization.

**Account Creation**: First-time users get accounts created automatically during either web app or MCP flows (Scenarios 1 and 4).

**Account Identification**: Existing accounts are identified by Strava user ID across all flows.

**PAT Dependency**: PATs require prior web app authentication and operate independently of Strava tokens.

## Authentication Flow Diagrams

### Web App Authentication Flow

Figure

### MCP Client Authentication Flow

Figure

## Options Considered & Decisions

### 1. API Structure: Separate vs Unified

**Options**:
- Single authentication API for all client types
- Separate authentication APIs per client type

**Decision**: **Separate APIs**
**Justification**: Different token delivery requirements make unified impossible:
- MCP OAuth 2.1 requires tokens in response body (RFC compliance)
- Web app requires HttpOnly cookies (XSS protection)

### 2. Callback Handling: Shared vs Separate

**Options**:
- Single `/callback` endpoint handling both web app and MCP flows via state parameter
- Separate `/auth/callback` and `/oauth/callback` endpoints

**Decision**: **Separate callbacks**
**Justification**: 
- Clear separation of concerns
- Intuitive API design 
- Different completion requirements (cookies vs authorization codes)
- Standard practice for different client types

### 3. Endpoint Structure

**Options**:
- `/auth/web/*` and `/oauth/*`
- `/oauth/web/*` and `/oauth/mcp/*`  
- `/auth/*` and `/oauth/*`

**Decision**: **`/auth/*` and `/oauth/*`**
**Justification**:
- Natural separation (federated auth vs OAuth 2.1 server)
- Simpler paths than adding `/web/` prefix
- Current implementation already uses `/auth/*`
- Web endpoints aren't "OAuth endpoints" from client perspective

### 4. Controller Organization

**Options**:
- Single `AuthController` handling all authentication
- Separate `AuthController` and `OAuthController`

**Decision**: **Separate controllers**
**Justification**:
- Different responsibilities (federated auth vs OAuth 2.1 compliance)
- Different middleware needs
- Different dependencies
- Consistent with existing architecture pattern

### 5. Token Signing Secrets

**Options**:
- Shared secrets across all authentication types
- Separate secrets per authentication type

**Decision**: **Separate secrets**
**Justification**:
- **Blast radius containment**: Compromise of one system doesn't affect others
- **Different threat models**: Web app (XSS) vs MCP clients (server-to-server)
- **Independent secret rotation**: Can rotate secrets per system without cross-impact
- **Clean architecture alignment**: Reinforces existing separation boundaries

### 6. Authorization Code Generation Strategy

**Options**:
- **Generate API's own authorization codes** (traditional OAuth)
- **Use Strava authorization codes directly** (pass-through)

**Option A: Generate Own Authorization Codes**
```
1. API generates unique authorization code
2. Store mapping: api_auth_code → {strava_code, oauth_params}
3. Return api_auth_code to MCP client
4. MCP exchanges api_auth_code for tokens
5. API validates and exchanges strava_code with Strava
```

**Pros**:
- **Traditional OAuth pattern**: Standard authorization server behavior
- **Full control**: API controls code format, expiration, validation
- **Flexible storage**: Can store additional context with codes
- **Clean separation**: Clear distinction between internal and external codes

**Cons**:
- **Storage requirement**: Need to store authorization code mappings
- **Additional complexity**: Code generation, validation, cleanup logic
- **More failure points**: Additional abstraction layer

**Option B: Use Strava Codes Directly**
```
1. Receive Strava authorization code from callback
2. Pass Strava code directly to MCP client
3. MCP exchanges Strava code for API tokens
4. API validates with Strava during token exchange
```

**Pros**:
- **Eliminates auth code storage**: No need to store code mappings
- **Simplified implementation**: Direct pass-through, fewer operations
- **Standards compliant**: Authorization codes are opaque to clients
- **Fewer failure points**: Less abstraction, more direct flow
- **PKCE compatible**: Can validate PKCE during token exchange

**Cons**:
- **Strava dependency**: Bound by Strava's code expiration rules
- **Less flexibility**: Limited ability to add OAuth-specific metadata
- **Architectural coupling**: Tighter coupling to Strava implementation

**Standards Compliance Analysis**:
Both approaches maintain OAuth 2.1 compliance:
- **Interface compliance**: Both provide standard `/oauth/authorize` and `/oauth/token` endpoints
- **Code opacity**: Clients treat authorization codes as opaque regardless of source
- **PKCE support**: Both can implement proper PKCE validation
- **Token issuance**: Both issue API's own access/refresh tokens

**Decision**: **Generate own authorization codes**
**Justification**: 
- **Best practices alignment**: Traditional OAuth 2.1 authorization server pattern
- **Enhanced UX capability**: Enables "skip Strava" scenario (Scenario 6) when combined with storage-based state
- **Future flexibility**: Easier to extend with additional OAuth features
- **Clean architecture**: Proper separation between identity provider (Strava) and authorization server (API)

### 7. OAuth State Management Strategy

**Options Considered**:

**Option A: Stateless (JSON state parameter)**
```
Encode {code_challenge, redirect_uri, state} as JSON in Strava state parameter
```

**Option B: Stateless + Signing (JWT state parameter)**
```
Sign OAuth parameters as JWT to prevent tampering
```

**Option C: Storage-based (server-side state)**
```
Store OAuth parameters server-side, send only state ID to Strava
```

**Security Analysis**:

**Parameter Exposure Risk**:
- **Options A & B**: OAuth parameters travel in URLs through entire OAuth flow
- **Exposure points**: Browser history, server logs, proxy logs, analytics, CDN caches
- **Risk**: `code_challenge`, `redirect_uri` visible in plaintext across infrastructure
- **Defense in depth violation**: Sensitive OAuth data scattered across systems

**Parameter Tampering Risk**:
- **Option A**: Vulnerable to parameter substitution attacks
  - Attacker can modify `code_challenge` to their own value
  - Bypass PKCE protection using corresponding `code_verifier`
  - Redirect manipulation to attacker-controlled endpoints
- **Option B**: JWT signing prevents tampering but doesn't solve exposure
- **Option C**: No tampering possible - parameters never leave server

**Mitigation Options**:
- **Signing (Option B)**: Solves tampering but not exposure
- **Encryption**: Could encrypt state but still exposes encrypted payload
- **Storage (Option C)**: Eliminates both exposure and tampering risks

**Decision**: **Storage-based approach (Option C)**
**Justification**:
- **Security first**: Prevents both parameter exposure and tampering
- **Best practices**: Follows OAuth 2.1 security recommendations
- **Clean audit trails**: No sensitive data in logs or URLs
- **Defense in depth**: OAuth parameters never leave secure server environment
- **Controlled expiration**: Server manages authorization code lifetime
- **Single-use enforcement**: Can ensure codes are used only once

**Implementation**:
```
1. Generate state ID, store {code_challenge, redirect_uri, original_state}
2. Send only state ID to Strava
3. Retrieve stored parameters on callback using state ID
4. Generate own authorization code with PKCE validation
```

**Trade-offs Accepted**:
- **Storage requirement**: Redis/cache needed for OAuth state (short-term, ~10 minutes)
- **Operational complexity**: State management and cleanup required
- **Implementation complexity**: More moving parts than stateless approaches

**Benefit Gained**: 
- **Superior UX**: Scenario 6 (skip Strava when already authenticated) possible
- **Security compliance**: Meets OAuth 2.1 security best practices

### 8. Alternative: Unified OAuth 2.1 Server

**Option**: Make web app an OAuth client using standard OAuth 2.1 flow

**Decision**: **Rejected**
**Justification**: Worse across quality attributes:
- **Security**: HttpOnly cookies > browser token storage (XSS protection)
- **Simplicity**: Current approach simpler than BFF patterns
- **Requirements**: PATs already handle arbitrary API access
- **No functional benefit** for increased complexity

## Final Architecture

**Web App Endpoints**:
```
GET  /auth/login     # Initiate Strava OAuth
GET  /auth/callback  # Handle Strava callback, set cookies, redirect  
GET  /auth/me        # Check authentication status
POST /auth/refresh   # Refresh access token
POST /auth/logout    # Clear session cookies
```

**MCP OAuth 2.1 Endpoints**:
```
GET  /.well-known/oauth-authorization-server  # Server metadata
POST /oauth/register     # Dynamic Client Registration
GET  /oauth/authorize    # Authorization endpoint
POST /oauth/token        # Token endpoint
GET  /oauth/callback     # Handle Strava callback, redirect to MCP client
```

**PAT Management Endpoints**:
```
POST /auth/tokens        # Create PAT (requires web session)
GET  /auth/tokens        # List user's PATs
DELETE /auth/tokens/{id} # Revoke PAT
```

**Security Configuration**:
```bash
# Web App Authentication
WEB_ACCESS_TOKEN_SECRET=
WEB_REFRESH_TOKEN_SECRET=

# MCP OAuth 2.1
MCP_ACCESS_TOKEN_SECRET=
MCP_REFRESH_TOKEN_SECRET=
```

**Key Design Insight**: Cookie domain sharing enables Scenario 6 - both cookie-setting (`/auth/callback`) and cookie-reading (`/oauth/authorize`) occur on same API domain, allowing MCP flow to detect existing web authentication.

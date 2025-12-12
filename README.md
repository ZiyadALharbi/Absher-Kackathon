# Aoun – Intelligent Government Services Agent

Aoun is an agentic AI system designed to orchestrate government services through intelligent, state-aware, and execution-capable interactions. Built with production-ready architecture, Aoun provides a unified interface for citizens to interact with government services via voice and text, with proactive state awareness and automated service execution workflows.

---

## 1. Technical Problem Statement

Current government service platforms face significant technical gaps that limit citizen experience and operational efficiency:

**Fragmented Service Architecture**: Citizens must navigate multiple disconnected platforms, each with its own authentication, data model, and workflow. This fragmentation creates cognitive overhead and increases the likelihood of missed deadlines or incomplete transactions.

**Lack of Proactive State Awareness**: Systems operate reactively, requiring citizens to initiate all interactions. There is no mechanism to monitor document expiration, violation deadlines, or service dependencies, leading to preventable penalties and administrative burden.

**Absence of Agent-Based Execution Layer**: Current platforms are form-filling interfaces without autonomous orchestration capabilities. Citizens must manually coordinate multi-step processes, understand service dependencies, and track completion across different agencies.

**Limited Contextual Intelligence**: Services operate in isolation without understanding user intent, historical context, or life-event relationships. This results in repetitive data entry and missed opportunities for service bundling.

Aoun addresses these gaps through an agentic architecture that unifies services, maintains state awareness, and executes workflows autonomously.

---

## 2. System Overview

Aoun is an **Agentic AI System** (not a chatbot) that operates as an intelligent orchestrator for government services. The system is:

**Event-Driven**: Responds to user intents, state changes, and time-based triggers (e.g., document expiration warnings).

**State-Aware**: Maintains a comprehensive view of citizen status across all government services, including documents, vehicles, violations, and life events.

**Execution-Capable**: Goes beyond information retrieval to actively execute service workflows, coordinate dependencies, and manage multi-step processes.

**API-Ready**: Designed with a clean separation between the agent layer and data sources, enabling seamless integration with real government APIs when available.

The system currently operates with **simulated data and mock APIs** for validation and demonstration purposes. The architecture is explicitly designed to transition to production APIs without structural changes.

---

## 3. Core Technical Architecture

### 3.1 Frontend Layer

**Technology Stack**:
- **Next.js 16.0.3** (App Router) – Server-side rendering, API routes, and optimized performance
- **TypeScript** – Type safety and maintainability
- **Tailwind CSS** – Utility-first styling with RTL-first Arabic UX
- **React 18.3.1** – Component-based architecture with hooks and context

**Key Components**:
- **Voice Interface**: Real-time speech-to-text (STT) and text-to-speech (TTS) with Voice Activity Detection (VAD)
- **Chat Interface**: Conversational UI with message history and context preservation
- **Service Orchestration UI**: Visual workflow tracking for multi-step processes
- **RTL-First Design**: Native right-to-left layout optimized for Arabic content

**API Integration**:
- Next.js API routes (`/api/chat`, `/api/tts`, `/api/voice`) act as middleware between frontend and AI services
- Client-side state management via React hooks and localStorage for session persistence
- Real-time updates through custom events and WebSocket-ready architecture

### 3.2 Backend & Agent Layer

**Technology Stack**:
- **FastAPI (Python)** – High-performance async API framework
- **LangGraph** – Agent workflow orchestration and state machine management
- **SQLModel** – Type-safe database models with SQLAlchemy core
- **Pydantic** – Data validation and serialization

**Agent Architecture**:
- **Service Graph**: LangGraph-based state machine that models service workflows as directed graphs
- **Tool Execution Layer**: Modular tools that encapsulate service-specific logic (violations, identity, vehicles, accidents)
- **State Management**: Persistent state tracking across agent invocations with context preservation
- **Decision Engine**: Rule-based and LLM-driven service selection based on user intent and current state

**Current Implementation**:
- Agent layer is implemented with mock tool wrappers that simulate API calls
- Tool interfaces match expected government API contracts
- State transitions are validated against service requirement specifications

### 3.3 AI Models

**LLM (Reasoning & Intent Understanding)**:
- **Model**: LLaMA 3.3 70B (via Groq LPU)
- **Use Case**: Intent classification, service selection, natural language understanding, and conversational reasoning
- **Optimization**: Token-efficient context management with smart service retrieval (only relevant services sent to LLM)

**Speech-to-Text (STT)**:
- **Provider**: OpenAI Whisper API
- **Language**: Arabic with automatic language detection
- **Format**: WebM audio (Opus codec) converted to WAV for API compatibility

**Text-to-Speech (TTS)**:
- **Provider**: ElevenLabs Multilingual v2
- **Voice ID**: Custom Saudi Arabic voice (`3nav5pHC1EYvWOd5LmnA`)
- **Settings**: Stability 0.5, Similarity Boost 0.75, Speed 1.2
- **Output**: High-quality MP3 audio stream

**Model Integration**:
- All AI services are abstracted behind service interfaces
- Fallback mechanisms for API failures
- Rate limiting and token management to prevent quota exhaustion

### 3.4 Knowledge & Data Layer

**Structured Knowledge Base**:
- **Service Requirements**: JSON-based specifications for 13+ government services, including requirements, steps, fees, and validation rules
- **Platform Information**: Structured data about Absher platform capabilities and service categories
- **Life Event Workflows**: Pre-defined service bundles for common life events (marriage, vehicle purchase)

**Data Storage**:
- **Vector Database Ready**: Architecture supports Pinecone/Weaviate for semantic search (not currently implemented)
- **Local Storage**: Browser localStorage for session data and user preferences
- **Mock Data**: JSON files for violations, documents, vehicles, and user profiles

**Data Flow**:
- Service requirements are loaded into LLM context via smart retrieval (keyword-based filtering to reduce token usage)
- User data is fetched from mock sources but structured to match expected API responses
- State changes are tracked locally with event-driven updates

---

## 4. Agentic Workflow Design

Aoun operates through a structured workflow that transforms user intent into executed actions:

### 4.1 Intent Detection

User input (voice or text) is processed by the LLM to extract:
- **Primary Intent**: What service does the user want? (e.g., "renew driving license")
- **Entities**: Specific identifiers (violation numbers, document types, dates)
- **Context**: Implicit requirements based on conversation history

**Implementation**: Groq LLaMA 3.3 analyzes user message with service requirements context, returning structured intent classification.

### 4.2 State Analysis

The system evaluates current citizen state:
- **Document Status**: Expiration dates, renewal eligibility windows
- **Violation Status**: Outstanding fines, payment deadlines, objection windows
- **Vehicle Status**: Registration, insurance, ownership transfers
- **Life Event Context**: Recent changes that trigger service dependencies

**Implementation**: Mock data is queried to simulate state checks. In production, this would query government databases via APIs.

### 4.3 Service Selection

Based on intent and state, the agent selects the appropriate service workflow:
- **Direct Match**: User intent maps directly to a service (e.g., "pay violation" → `traffic_violation_payment`)
- **Life Event Bundle**: User intent triggers a multi-service workflow (e.g., "I got married" → marriage bundle)
- **Dependency Resolution**: Service selection considers prerequisites (e.g., cannot renew license with outstanding violations)

**Implementation**: Keyword-based service retrieval from `service_requirements.json`, with LLM final selection.

### 4.4 Action Planning

The agent generates an execution plan:
- **Step Sequence**: Ordered list of actions required to complete the service
- **Data Requirements**: What information must be collected from the user
- **Validation Rules**: Pre-execution checks (e.g., sufficient wallet balance, valid expiration window)
- **Dependency Mapping**: Services that must complete before this one can proceed

**Implementation**: Service requirements JSON defines steps and validation rules. Agent constructs plan dynamically.

### 4.5 Execution Simulation

Actions are executed through tool calls:
- **Tool Invocation**: Each service step maps to a tool (e.g., `check_violations`, `process_payment`)
- **State Updates**: Tool results update citizen state
- **Progress Tracking**: UI reflects completion status for each step
- **Error Handling**: Validation failures trigger user prompts or alternative paths

**Implementation**: Mock tools simulate API calls with realistic delays and responses. Tool interfaces match expected production API contracts.

### 4.6 Error Handling & Fallback Strategies

- **Validation Failures**: User is informed of missing prerequisites with actionable guidance
- **API Failures**: Graceful degradation with retry logic and user notification
- **Ambiguous Intents**: Agent asks clarifying questions using LLM-generated prompts
- **Timeout Handling**: Long-running operations are tracked with progress indicators

**Pseudo-Flow Example**:

```
User: "أريد تجديد رخصة القيادة"
  ↓
Intent Detection: renew_driving_license
  ↓
State Analysis: 
  - Check violations (outstanding_fines == 0?) → PASS
  - Check medical report (status == 'valid'?) → PASS
  - Check renewal window (remaining_validity < 365?) → PASS
  ↓
Service Selection: renew_driving_license
  ↓
Action Planning:
  1. Collect renewal duration (2/5/10 years)
  2. Verify wallet balance (fee_by_duration[duration])
  3. Process payment
  4. Submit renewal request
  ↓
Execution:
  - Tool: get_user_violations() → []
  - Tool: get_wallet_balance() → 5000 SAR
  - User Input: duration = 5 years
  - Tool: process_payment(amount=200) → SUCCESS
  - Tool: submit_renewal(duration=5) → SUCCESS
  ↓
State Update: driving_license.validity += 5 years
  ↓
Response: "تم تجديد رخصة القيادة بنجاح لمدة 5 سنوات"
```

---

## 5. Life Event Bundles (Core Innovation)

Life Event Bundles represent Aoun's core innovation: treating citizen life changes as unified workflows rather than isolated service transactions.

### 5.1 Concept

When a citizen experiences a life event (e.g., marriage, vehicle purchase), multiple government services must be updated in a specific order with dependencies. Traditional platforms require citizens to:
1. Identify all affected services manually
2. Understand dependency order
3. Complete each service separately
4. Track completion across platforms

Aoun bundles these services into a single workflow that the agent orchestrates automatically.

### 5.2 Implementation

**Event Definition**: Each life event is defined as a service graph:
- **Nodes**: Individual services (e.g., "update marital status", "link family records")
- **Edges**: Dependencies (e.g., marital status must update before family records can link)
- **Data Flow**: Shared data across services (e.g., spouse national ID used in multiple steps)

**State Transitions**: The agent treats life events as state machine transitions:
- **Initial State**: Pre-event citizen state
- **Transition**: Event triggers workflow initiation
- **Intermediate States**: Each service completion updates state
- **Final State**: All services complete, citizen state fully updated

**Dependency Management**: The agent automatically:
- Identifies prerequisite services
- Executes services in correct order
- Waits for dependencies before proceeding
- Handles partial failures with rollback or retry

**Example: Marriage Bundle**

```
User: "تزوجت الأسبوع الماضي"
  ↓
Event Detection: marriage_life_event
  ↓
Bundle Activation:
  Service 1: Update marital status (prerequisite: none)
    → State: marital_status = "married"
  Service 2: Link spouse records (prerequisite: Service 1)
    → State: spouse_linked = true
  Service 3: Update family records (prerequisite: Service 2)
    → State: family_updated = true
  Service 4: Notify relevant agencies (prerequisite: Service 3)
    → State: notifications_sent = true
  ↓
Workflow Complete: All services executed in order
```

---

## 6. API Readiness & Integration Strategy

**Critical Disclaimer**: Aoun currently operates with **mock data and simulated APIs**. No direct integration with Absher or government APIs exists. The system is architected for instant API enablement when access is granted.

### 6.1 Current State

**Mock Data Sources**:
- User profiles, violations, documents, and vehicles are stored in JSON files
- Service execution is simulated with realistic delays and responses
- Payment processing uses localStorage-based wallet simulation
- All state changes are local and non-persistent

**Simulated API Layer**:
- Tool wrappers (`backend/agents/tools/`) simulate API calls
- Response structures match expected government API contracts
- Error scenarios are modeled (rate limits, validation failures, timeouts)

### 6.2 Architecture for API Integration

**Tool Abstraction Layer**: All service interactions go through tool interfaces:

```python
class ServiceTool:
    async def execute(self, params: dict) -> ToolResult:
        # Current: Mock implementation
        # Production: HTTP client to government API
        pass
```

**API Contract Design**: Tool interfaces are designed to match expected government API patterns:

**Example: Violation Payment API**

```typescript
// Expected API Contract (Pseudo)
POST /api/v1/violations/{violation_id}/payment
Headers: {
  Authorization: "Bearer {token}",
  X-User-National-ID: "{national_id}"
}
Body: {
  payment_method: "wallet" | "card",
  amount: number,
  wallet_id?: string
}
Response: {
  transaction_id: string,
  status: "success" | "failed",
  remaining_balance?: number,
  receipt_url?: string
}
```

**Current Mock Implementation**:

```typescript
// Mock tool simulates this API
async function processViolationPayment(violationId: string, amount: number) {
  // Simulate API delay
  await delay(500);
  
  // Simulate wallet deduction
  const balance = getWalletBalance();
  if (balance >= amount) {
    updateWalletBalance(balance - amount);
    return { status: "success", transaction_id: generateId() };
  }
  return { status: "failed", error: "insufficient_balance" };
}
```

**Production Replacement**: Replace mock function with HTTP client:

```typescript
async function processViolationPayment(violationId: string, amount: number) {
  const response = await fetch(
    `${GOV_API_BASE}/api/v1/violations/${violationId}/payment`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ payment_method: "wallet", amount })
    }
  );
  return await response.json();
}
```

### 6.3 Integration Points

**Authentication & Authorization**:
- Current: Mock session tokens in localStorage
- Production: OAuth 2.0 / OpenID Connect with government identity provider
- Token refresh and session management ready for implementation

**Data Synchronization**:
- Current: One-way data flow (mock → UI)
- Production: Bi-directional sync with government databases
- Conflict resolution strategies defined (last-write-wins, merge policies)

**Service Discovery**:
- Current: Hard-coded service list in `service_requirements.json`
- Production: Dynamic service registry API call on startup
- Service versioning and deprecation handling

### 6.4 Security & Governance Considerations

**API Security**:
- All API calls will use HTTPS with certificate pinning
- Request signing for sensitive operations (payment, document updates)
- Rate limiting and quota management per user/tenant

**Data Privacy**:
- PII encryption at rest and in transit
- Audit logging for all state-changing operations
- GDPR-compliant data retention policies

**Governance**:
- Service-level agreements (SLA) monitoring
- Circuit breakers for API failures
- Fallback to cached data when APIs are unavailable

---

## 7. Testing & Validation

### 7.1 Scenario-Based Testing

**User Journey Tests**:
- Complete service workflows from intent to completion
- Multi-step processes with dependency validation
- Error recovery and retry scenarios

**Voice Interaction Tests**:
- Speech-to-text accuracy for Arabic dialects
- Turn-taking and conversation flow
- Audio quality and latency measurements

**State Transition Tests**:
- Document expiration warnings trigger correctly
- Life event bundles execute in correct order
- Partial failures don't corrupt state

### 7.2 Error-State Simulations

**API Failure Scenarios**:
- Network timeouts
- Rate limit exceeded
- Invalid authentication
- Service unavailable

**Validation Failure Scenarios**:
- Insufficient wallet balance
- Missing prerequisites
- Expired eligibility windows
- Duplicate transaction attempts

### 7.3 UX Flow Testing

**Accessibility**:
- Screen reader compatibility
- Keyboard navigation
- RTL layout validation
- Voice-only interaction paths

**Performance**:
- Page load times < 2 seconds
- API response times < 500ms (simulated)
- Smooth animations and transitions
- Mobile device compatibility

---

## 8. Scalability & Production Readiness

### 8.1 Modular Services

**Microservices Architecture Ready**:
- Frontend, backend, and agent layers are independently deployable
- API routes can be extracted to separate services
- Database layer is abstracted and swappable

**Service Isolation**:
- Each government service is implemented as an independent tool
- Service failures don't cascade to other services
- Individual services can be updated without system-wide changes

### 8.2 Horizontal Scaling

**Stateless Design**:
- Agent state is stored externally (database, cache)
- Multiple agent instances can handle requests concurrently
- Load balancing ready with session affinity for voice calls

**Caching Strategy**:
- Service requirements cached in memory
- User state cached with TTL-based invalidation
- API responses cached where appropriate (read-only data)

### 8.3 Multi-Agency Support

**Agency Abstraction**:
- Service definitions are agency-agnostic
- Tool layer can route to different agency APIs
- Unified citizen view across agencies

**Tenant Isolation**:
- Architecture supports multi-tenant deployment
- Agency-specific configurations via environment variables
- Data isolation at database/API level

### 8.4 Observability & Monitoring Readiness

**Logging**:
- Structured logging with correlation IDs
- Request/response logging for API calls
- Agent decision logs for audit trails

**Metrics**:
- Request latency and throughput
- Error rates by service
- User engagement metrics (voice vs. text, service completion rates)

**Tracing**:
- Distributed tracing ready (OpenTelemetry compatible)
- End-to-end request tracking across frontend, backend, and agent layers

---

## 9. Limitations & Current Constraints

**No Live API Integration**: The system operates entirely with mock data. No connections to Absher, Ministry of Interior, or any government APIs exist. All service executions are simulated.

**Simulated Data**: User profiles, violations, documents, and vehicles are generated from JSON files. Data does not reflect real citizen records.

**Hackathon Scope**: The implementation prioritizes demonstration of architectural concepts over production hardening. Security, performance optimization, and comprehensive error handling are implemented to proof-of-concept level.

**Limited Service Coverage**: Currently implements 13 government services. Production deployment would require expansion to full Absher service catalog.

**Voice Quality**: TTS uses custom ElevenLabs voice optimized for Saudi Arabic, but may not match native speaker quality in all contexts.

**No Persistent Storage**: User sessions and state are stored in browser localStorage. Production would require server-side session management and database persistence.

---

## 10. Future Roadmap

### 10.1 API Enablement

**Phase 1: Authentication Integration**
- Integrate with government identity provider (National Authentication System)
- Implement OAuth 2.0 token flow
- Session management and token refresh

**Phase 2: Read-Only API Integration**
- Connect to citizen data APIs (violations, documents, vehicles)
- Implement caching and synchronization strategies
- Handle API rate limits and quotas

**Phase 3: Write API Integration**
- Enable service execution through government APIs
- Implement transaction rollback for failures
- Real-time status updates from government systems

### 10.2 Security Hardening

- Implement request signing for sensitive operations
- Add encryption for PII at rest and in transit
- Security audit and penetration testing
- Compliance with government security standards

### 10.3 Performance Optimization

- Database query optimization
- API response caching strategies
- CDN deployment for static assets
- Voice call latency reduction (< 200ms end-to-end)

### 10.4 Deployment Readiness

- Containerization (Docker) for all services
- Kubernetes deployment manifests
- CI/CD pipeline for automated testing and deployment
- Monitoring and alerting setup (Prometheus, Grafana)

---

## 11. Local Setup

### Prerequisites

- Node.js 18.0 or higher
- Python 3.10 or higher (for backend)
- npm or yarn package manager

### Installation

```bash
# Clone repository
git clone https://github.com/ZiyadALharbi/Absher-Kackathon.git
cd Absher-Kackathon

# Frontend setup
cd front-end/clone-website-ui
npm install

# Create environment file
cp .env.example .env.local
# Add your API keys:
# - GROQ_API_KEY (for LLM)
# - OPENAI_API_KEY (for Whisper STT)
# - ELEVENLABS_API_KEY (for TTS)

# Backend setup (optional, for full stack)
cd ../../backend
pip install -r requirements.txt
```

### Running the Application

```bash
# Start frontend (from front-end/clone-website-ui/)
npm run dev

# Start backend (optional, from backend/)
uvicorn main:app --reload --port 8001
```

### Access

- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8001/docs (if backend is running)

### Demo Users

The system includes mock users for demonstration:
- **Budi Santoso** (Indonesian) - Triggers language detection modal
- **أحمد محمد** (Saudi) - Triggers behavioral greeting

Login page: http://localhost:3000/login

---

## Technical Contact

For technical inquiries or API integration discussions, please refer to the repository documentation or contact the development team through GitHub issues.

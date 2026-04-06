# OmniScript™ Quick Start — FluxWork™

**Classification:** CONFIDENTIAL — PROPRIETARY — TRADE SECRET  
**© 2024-2026 Jeffrey W Williams LLC. All Rights Reserved.**

---

## Overview

OmniScript™ is the proprietary domain-specific language (DSL) powering the Omnivex™ ecosystem. This guide covers the FluxWork™ integration.

## File Structure

```
omniscript/
├── main.omni          # Main entry point — universe, pipeline, event handlers
├── engines.omni       # Engine declarations and connection specs
├── services.omni      # Service declarations (REST, WebSocket, gRPC)
├── config.omnirc      # Runtime configuration
└── omni.manifest      # Package manifest
```

## Key Concepts

### Universe
The `universe` block defines the application's domain scope, engine connections, and context subscriptions.

### Pipeline
The `pipeline` block defines the intelligence processing stages: Ingest → Decompose → Map → Generate → Propagate.

### Signals
Engine connections use bidirectional signals: outbound (domain telemetry) and inbound (engine intelligence).

## Running OmniScript

```bash
# Validate OmniScript files
omniscript validate ./omniscript/

# Run the intelligence pipeline
omniscript run ./omniscript/main.omni

# Check engine connections
omniscript engines ./omniscript/engines.omni
```

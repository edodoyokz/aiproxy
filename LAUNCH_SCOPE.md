# Aiproxy Public Beta Launch Scope

**Launch Mode:** Public Beta  
**Target Date:** TBD  
**Commercial Model:** Free tier only (no billing at launch)

## What's In Scope

### Core Functionality
- ✅ User signup and authentication
- ✅ Workspace creation (one workspace per user at signup)
- ✅ Platform admin authorization (env-based allowlist + database flag)
- ✅ Provider connection (OpenAI primary, others experimental)
- ✅ API key issuance and management
- ✅ Runtime-backed proxy requests via CLIProxyAPIPlus
- ✅ Usage tracking and analytics
- ✅ Audit logging for security events

### Supported Providers
- **Primary:** OpenAI (fully supported)
- **Experimental:** Other providers supported by CLIProxyAPIPlus (best-effort)

### Deployment
- Single region (US East)
- PostgreSQL database
- Docker-based deployment
- Manual operations and support

## What's NOT In Scope

### Deferred to Post-Beta
- ❌ Self-serve billing and subscriptions
- ❌ Multi-region runtime placement
- ❌ Advanced autoscaling
- ❌ Enterprise SSO/SAML
- ❌ Advanced analytics dashboards
- ❌ Multi-workspace per user
- ❌ Team collaboration features

### Explicitly Unsupported at Launch
- Payment processing
- Automated plan upgrades
- SLA guarantees
- 24/7 support

## Beta Limitations

### Rate Limits
- Login attempts: 3 failures trigger backoff
- API requests: Per-workspace limits enforced
- Signup: Standard rate limiting applied

### Capacity
- Limited user volume during beta
- Manual approval for high-volume workspaces
- Best-effort availability (no SLA)

### Support
- Community support via GitHub issues
- Email support for critical issues only
- Response time: best effort (no guarantees)

## User Expectations

### What Users Should Expect
- Free access to core proxy functionality
- Experimental/beta stability level
- Potential breaking changes with notice
- Manual intervention for edge cases
- Active development and iteration

### What Users Should NOT Expect
- Production-grade SLA
- Guaranteed uptime
- Immediate support responses
- Feature parity with enterprise solutions
- Backward compatibility guarantees during beta

## Success Criteria

### Technical Readiness
- ✅ Platform admin separated from workspace roles
- ✅ PostgreSQL migrations reproducible from scratch
- ✅ CI pipeline running on all commits
- ✅ Deployment runbook tested end-to-end
- ⏳ Golden path (signup → provider → key → request) works in staging
- ⏳ Health/readiness endpoints truthful
- ⏳ Distributed rate limiting for auth routes
- ⏳ Structured logging and error monitoring

### Operational Readiness
- Deployment runbook documented
- Rollback procedure defined
- Database backup/restore tested
- Incident response checklist created
- Monitoring dashboard configured

### Product Readiness
- Landing page reflects beta positioning
- Documentation matches actual capabilities
- Pricing page shows "Coming Soon" or waitlist
- Terms of Service include beta disclaimers
- Privacy policy in place

## Post-Beta Roadmap

### Phase 1: Billing Integration (4-6 weeks post-beta)
- Stripe integration
- Subscription lifecycle management
- Plan upgrade/downgrade flows
- Usage-based billing support

### Phase 2: Enhanced Reliability (6-8 weeks post-beta)
- Multi-region support
- Advanced health checks
- Automated failover
- Enhanced monitoring

### Phase 3: Enterprise Features (8-12 weeks post-beta)
- SSO/SAML support
- Team collaboration
- Advanced analytics
- Custom SLAs

## Launch Checklist

See `RELEASE_CHECKLIST.md` for detailed pre-launch verification steps.

## Contact

For beta access inquiries or critical issues:
- GitHub Issues: [repository URL]
- Email: [support email]

---

**Last Updated:** 2026-04-22  
**Status:** Pre-launch preparation

# Rate Limiting - Technical Notes

## Current Implementation

Aiproxy uses in-memory rate limiting for authentication routes during the beta phase.

### Authentication Rate Limiting

**Location:** `src/lib/rate-limit.ts`

**Mechanism:**
- In-memory Map storing failed login attempts per email
- 3 failed attempts trigger exponential backoff
- Backoff periods: 1 minute, 5 minutes, 15 minutes
- Cleanup runs every 5 minutes to prevent memory leaks

**Protected Routes:**
- `POST /api/auth/login` - Login attempts
- `POST /api/auth/signup` - Account creation

### Workspace API Rate Limiting

**Location:** `src/lib/workspace.ts` (checkWorkspaceLimit function)

**Mechanism:**
- Database-backed usage tracking
- Per-workspace request limits
- Enforced before proxy request forwarding

## Beta Limitations

### 1. Not Distributed

**Issue:** Rate limit state is stored in-memory per application instance.

**Impact:**
- Multi-instance deployments will have separate rate limit counters
- A user could bypass limits by hitting different instances
- Load balancer with sticky sessions partially mitigates this

**Example:**
```
Instance A: User fails login 3 times → blocked
Instance B: Same user can attempt 3 more times → not blocked
```

**Mitigation for Beta:**
- Single instance deployment recommended
- Document limitation in LAUNCH_SCOPE.md
- Monitor for abuse patterns

### 2. Memory Leaks Possible

**Issue:** Failed attempt records stored indefinitely until cleanup runs.

**Impact:**
- High-volume attack could consume memory before cleanup
- Cleanup interval (5 minutes) may be too long under load

**Mitigation for Beta:**
- Monitor memory usage
- Reduce cleanup interval if needed
- Implement max entries limit

### 3. No Persistence

**Issue:** Rate limit state lost on application restart.

**Impact:**
- Attackers can bypass limits by forcing restarts
- Legitimate users blocked before restart are immediately unblocked

**Mitigation for Beta:**
- Monitor restart frequency
- Log rate limit violations for analysis
- Consider shorter backoff periods

## Post-Beta Improvements

### Recommended: Redis-Based Rate Limiting

**Benefits:**
- Distributed state across all instances
- Persistent across restarts
- Better performance at scale
- Built-in TTL for automatic cleanup

**Implementation Approach:**
```typescript
// Pseudocode for Redis-based rate limiting
async function checkRateLimit(key: string): Promise<boolean> {
  const attempts = await redis.incr(`ratelimit:${key}`)
  
  if (attempts === 1) {
    await redis.expire(`ratelimit:${key}`, 3600) // 1 hour TTL
  }
  
  return attempts <= MAX_ATTEMPTS
}
```

**Libraries to Consider:**
- `ioredis` - Redis client
- `rate-limiter-flexible` - Advanced rate limiting with Redis backend
- `express-rate-limit` with Redis store

### Alternative: Database-Based Rate Limiting

**Benefits:**
- No additional infrastructure
- Persistent and distributed
- Audit trail built-in

**Drawbacks:**
- Higher latency than Redis
- More database load
- Requires careful indexing

## Monitoring Recommendations

### Metrics to Track
- Failed login attempts per minute
- Rate limit violations per hour
- Memory usage of rate limit store
- Cleanup operation duration

### Alerts to Configure
- Spike in failed login attempts (>100/min)
- Memory usage >80% of limit
- Rate limit cleanup failures

### Log Analysis
```bash
# Find rate limit violations
grep "Rate limit exceeded" logs/*.log | wc -l

# Top offending IPs
grep "Rate limit exceeded" logs/*.log | \
  grep -oP 'ip=\K[0-9.]+' | \
  sort | uniq -c | sort -rn | head -10
```

## Testing Rate Limits

### Manual Testing
```bash
# Test login rate limiting
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
  echo "Attempt $i"
done
```

### Automated Testing
See `src/lib/__tests__/rate-limit.test.ts` for unit tests.

## Configuration

### Environment Variables
```bash
# Not currently configurable via env vars
# Hardcoded in src/lib/rate-limit.ts
MAX_FAILED_ATTEMPTS=3
BACKOFF_PERIODS=[60000, 300000, 900000] # milliseconds
CLEANUP_INTERVAL=300000 # 5 minutes
```

### Future Configuration
Consider making these configurable:
- `RATE_LIMIT_MAX_ATTEMPTS`
- `RATE_LIMIT_BACKOFF_BASE`
- `RATE_LIMIT_CLEANUP_INTERVAL`
- `RATE_LIMIT_BACKEND` (memory|redis|database)

## Security Considerations

### Current Protections
- Rate limiting by email (not IP) prevents distributed attacks
- Exponential backoff increases cost of brute force
- Cleanup prevents indefinite blocking

### Known Gaps
- No IP-based rate limiting
- No CAPTCHA after repeated failures
- No account lockout mechanism
- No notification to user on suspicious activity

### Recommendations for Production
1. Add IP-based rate limiting as secondary layer
2. Implement CAPTCHA after 5 failed attempts
3. Add account lockout after 10 failed attempts
4. Send email notification on suspicious login activity
5. Implement 2FA for high-value accounts

---

**Last Updated:** 2026-04-22  
**Status:** Beta implementation - in-memory only  
**Next Review:** Post-beta (when implementing Redis)

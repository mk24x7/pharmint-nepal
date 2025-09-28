import { MedusaRequest } from "@medusajs/framework/http"

interface TrustedProxyConfig {
  trustedProxies: string[]
  xForwardedForHeader: boolean
  xRealIpHeader: boolean
  cfConnectingIpHeader: boolean // For Cloudflare
}

/**
 * Secure IP detection utility that validates proxy headers against trusted sources
 * Prevents IP spoofing attacks by only accepting forwarded headers from trusted proxies
 */
export class SecureIPDetection {
  private config: TrustedProxyConfig

  constructor(config: Partial<TrustedProxyConfig> = {}) {
    this.config = {
      trustedProxies: process.env.TRUSTED_PROXY_IPS?.split(',').map(ip => ip.trim()) || [],
      xForwardedForHeader: true,
      xRealIpHeader: true, 
      cfConnectingIpHeader: true, // Cloudflare support
      ...config
    }
  }

  /**
   * Extract client IP address securely, validating proxy headers
   */
  getClientIP(req: MedusaRequest): string {
    // Start with direct connection IP
    let clientIP = this.getDirectConnectionIP(req)
    
    // If we have trusted proxies configured, check forwarded headers
    if (this.config.trustedProxies.length > 0) {
      const forwardedIP = this.getTrustedForwardedIP(req)
      if (forwardedIP) {
        clientIP = forwardedIP
      }
    }

    // Validate and normalize the IP
    return this.validateAndNormalizeIP(clientIP) || 'unknown'
  }

  private getDirectConnectionIP(req: MedusaRequest): string {
    // Try multiple sources for direct connection IP
    return req.socket?.remoteAddress || 
           req.connection?.remoteAddress || 
           req.ip || 
           'unknown'
  }

  private getTrustedForwardedIP(req: MedusaRequest): string | null {
    // Get the immediate proxy IP (the one that connected to us)
    const immediateProxy = this.getDirectConnectionIP(req)
    
    // Only trust forwarded headers if the immediate proxy is in our trusted list
    if (!this.isTrustedProxy(immediateProxy)) {
      return null
    }

    // Check headers in order of reliability
    const headers = [
      { key: 'cf-connecting-ip', enabled: this.config.cfConnectingIpHeader }, // Cloudflare
      { key: 'x-real-ip', enabled: this.config.xRealIpHeader }, // Nginx
      { key: 'x-forwarded-for', enabled: this.config.xForwardedForHeader } // Standard
    ]

    for (const header of headers) {
      if (!header.enabled) continue
      
      const value = req.headers[header.key]
      if (typeof value === 'string' && value) {
        // For x-forwarded-for, take the first IP (original client)
        if (header.key === 'x-forwarded-for') {
          const ips = value.split(',').map(ip => ip.trim()).filter(ip => ip)
          if (ips.length > 0) {
            return ips[0] // First IP is the original client
          }
        } else {
          return value.trim()
        }
      }
    }

    return null
  }

  private isTrustedProxy(ip: string): boolean {
    if (!ip || ip === 'unknown') return false
    
    // Normalize IP for comparison
    const normalizedIP = this.validateAndNormalizeIP(ip)
    if (!normalizedIP) return false

    return this.config.trustedProxies.some(trustedIP => {
      // Support CIDR notation later if needed, for now exact match
      return normalizedIP === this.validateAndNormalizeIP(trustedIP)
    })
  }

  private validateAndNormalizeIP(ip: string): string | null {
    if (!ip || ip === 'unknown') return null

    // Remove IPv6 wrapper if present
    let cleanIP = ip.replace(/^\[|\]$/g, '')
    
    // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
    if (cleanIP.startsWith('::ffff:')) {
      cleanIP = cleanIP.substring(7)
    }

    // Basic IP validation (IPv4 and IPv6)
    if (this.isValidIPv4(cleanIP) || this.isValidIPv6(cleanIP)) {
      return cleanIP
    }

    return null
  }

  private isValidIPv4(ip: string): boolean {
    const ipv4Regex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/
    return ipv4Regex.test(ip)
  }

  private isValidIPv6(ip: string): boolean {
    // Simplified IPv6 validation - in production, use a proper library
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
    return ipv6Regex.test(ip) || ip.includes(':')
  }

  /**
   * Generate a rate limiting key for the given request and endpoint
   */
  generateRateLimitKey(req: MedusaRequest, endpoint: string, identifier?: string): string {
    const clientIP = this.getClientIP(req)
    const baseIdentifier = identifier || clientIP
    
    // Include user agent hash for additional entropy (optional)
    const userAgent = req.headers['user-agent']
    const uaHash = userAgent ? this.simpleHash(userAgent) : ''
    
    return `rate_limit:${endpoint}:${baseIdentifier}:${uaHash}`
  }

  private simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < Math.min(str.length, 50); i++) { // Limit length for performance
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 8)
  }
}

// Global instance with environment-based configuration
export const secureIPDetection = new SecureIPDetection({
  trustedProxies: [
    // Common trusted proxy IPs - configure via environment
    '127.0.0.1',
    '::1',
    ...(process.env.TRUSTED_PROXY_IPS?.split(',').map(ip => ip.trim()) || [])
  ].filter(Boolean)
})

// Utility function for easy usage
export function getSecureClientIP(req: MedusaRequest): string {
  return secureIPDetection.getClientIP(req)
}
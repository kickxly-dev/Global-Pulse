import { useState, useEffect } from 'react'

interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

interface TwoFactorStatus {
  enabled: boolean
  verified: boolean
  setup?: TwoFactorSetup
}

export function useTwoFactor() {
  const [status, setStatus] = useState<TwoFactorStatus>({
    enabled: false,
    verified: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load 2FA status from localStorage (in production, this would be from backend)
    const saved = localStorage.getItem('twoFactorStatus')
    if (saved) {
      try {
        setStatus(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load 2FA status:', e)
      }
    }
  }, [])

  const generateSecret = (): string => {
    // Generate a random secret (in production, use a proper TOTP library)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let secret = ''
    for (let i = 0; i < 16; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return secret
  }

  const generateBackupCodes = (): string[] => {
    // Generate 8 backup codes
    const codes: string[] = []
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const generateQRCode = (secret: string, email: string): string => {
    // Generate QR code URL for authenticator apps
    const issuer = 'Global Pulse'
    const encodedIssuer = encodeURIComponent(issuer)
    const encodedEmail = encodeURIComponent(email)
    const otpauthUrl = `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
    
    // Use QR code API (in production, generate server-side)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
  }

  const setupTwoFactor = async (email: string): Promise<TwoFactorSetup> => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const secret = generateSecret()
    const backupCodes = generateBackupCodes()
    const qrCode = generateQRCode(secret, email)
    
    const setup: TwoFactorSetup = {
      secret,
      qrCode,
      backupCodes,
    }
    
    setStatus({
      enabled: false,
      verified: false,
      setup,
    })
    
    setIsLoading(false)
    return setup
  }

  const verifyTwoFactor = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Simulate API call to verify TOTP code
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // In production, verify against actual TOTP
    // For demo, accept any 6-digit code
    const isValid = /^\d{6}$/.test(code)
    
    if (isValid) {
      const newStatus: TwoFactorStatus = {
        enabled: true,
        verified: true,
      }
      setStatus(newStatus)
      localStorage.setItem('twoFactorStatus', JSON.stringify(newStatus))
    }
    
    setIsLoading(false)
    return isValid
  }

  const verifyBackupCode = async (code: string): Promise<boolean> => {
    // Check if backup code is valid
    const savedCodes = localStorage.getItem('backupCodes')
    if (savedCodes) {
      const codes = JSON.parse(savedCodes)
      const index = codes.indexOf(code.toUpperCase())
      if (index > -1) {
        // Remove used backup code
        codes.splice(index, 1)
        localStorage.setItem('backupCodes', JSON.stringify(codes))
        return true
      }
    }
    return false
  }

  const disableTwoFactor = async (code: string): Promise<boolean> => {
    setIsLoading(true)
    
    // Verify code before disabling
    const isValid = await verifyTwoFactor(code)
    
    if (isValid) {
      setStatus({ enabled: false, verified: false })
      localStorage.removeItem('twoFactorStatus')
      localStorage.removeItem('backupCodes')
    }
    
    setIsLoading(false)
    return isValid
  }

  const saveBackupCodes = (codes: string[]) => {
    localStorage.setItem('backupCodes', JSON.stringify(codes))
  }

  return {
    status,
    isLoading,
    setupTwoFactor,
    verifyTwoFactor,
    verifyBackupCode,
    disableTwoFactor,
    saveBackupCodes,
  }
}

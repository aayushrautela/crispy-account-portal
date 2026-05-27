export interface UserData {
  id: string
  email: string
}

export interface AccountSettings {
  pricingTier?: string
  ai?: Record<string, unknown>
  metadata?: Record<string, unknown>
  [key: string]: unknown
}

export interface Profile {
  id: string
  name: string
  avatarKey?: string | null
  interfaceLanguage?: string
  region?: string | null
  isKids?: boolean
  sortOrder?: number
  [key: string]: unknown
}

export interface SecretMetadata {
  key: string
  present: boolean
  fingerprint: string
}

export type ConnectionState = 'not_connected' | 'pending_authorization' | 'connected' | 'reauthorization_required'
export type AccountStatus = 'pending' | 'connected' | 'expired' | 'revoked'
export type PrimaryAction = 'connect' | 'import' | 'reconnect'
export type NextAction = 'authorize_provider' | 'queued'
export type JobStatus = 'oauth_pending' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

export interface ProviderState {
  provider: 'trakt' | 'simkl'
  connectionState: ConnectionState
  accountStatus: AccountStatus | null
  primaryAction: PrimaryAction
  canImport: boolean
  canReconnect: boolean
  canDisconnect: boolean
  externalUsername: string | null
  statusLabel: string
  statusMessage: string | null
  lastImportCompletedAt: string | null
}

export interface ImportJob {
  id: string
  provider: string
  status: JobStatus
  progress?: number
  errorMessage?: string | null
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}

export interface PatToken {
  id: string
  name: string
  scopes?: string[]
  expiresAt?: string | null
  lastUsedAt?: string | null
  createdAt: string
  [key: string]: unknown
}

export interface PatCreateResult {
  token: {
    plaintext?: string
    id: string
    name: string
    [key: string]: unknown
  }
}

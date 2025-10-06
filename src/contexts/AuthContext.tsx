'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'

interface Branch {
  id: string
  name: string
  groupId: string
}

interface UserBranchRole {
  userId: string
  branchId: string
  role: 'admin' | 'member' | 'viewer'
}

interface AuthContextType {
  user: any
  isLoaded: boolean
  isSignedIn: boolean
  userBranches: Branch[]
  activeBranch: Branch | null
  activeBranchRole: string | null
  setActiveBranch: (branch: Branch) => void
  hasAccessToBranch: (branchId: string) => boolean
  isAdmin: () => boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: Readonly<AuthProviderProps>) {
  const { user, isLoaded, isSignedIn } = useUser()
  const [userBranches, setUserBranches] = useState<Branch[]>([])
  const [activeBranch, setActiveBranchState] = useState<Branch | null>(null)
  const [activeBranchRole, setActiveBranchRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Charger les branches accessibles par l'utilisateur
  const loadUserBranches = useCallback(async () => {
    if (!user?.id) {
      setUserBranches([])
      setActiveBranchState(null)
      setActiveBranchRole(null)
      setIsLoading(false)
      return
    }

    try {
      // Récupérer les branches via l'API
      const response = await fetch('/api/user/branches')
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des branches')
      }

      const data = await response.json()
      const branchesList = data.branches || []
      const roles = data.roles || {}

      setUserBranches(branchesList)

      // Si aucune branche trouvée, essayer de migrer depuis Clerk metadata
      if (branchesList.length === 0) {
        const legacyBranch = user.publicMetadata?.branch as string
        if (legacyBranch) {
          await migrateFromLegacyBranch(user.id, legacyBranch)
          // Relancer le chargement après migration
          loadUserBranches()
          return
        }
      }

      // Définir la branche active (priorité : 1. Clerk metadata, 2. première branche)
      const legacyActiveBranchId = user.publicMetadata?.activeBranchId as string
      let activeBranchToSet: Branch | null = null

      if (legacyActiveBranchId) {
        activeBranchToSet = branchesList.find((b: Branch) => b.id === legacyActiveBranchId) || branchesList[0] || null
      } else {
        activeBranchToSet = branchesList[0] || null
      }

      setActiveBranchState(activeBranchToSet)

      if (activeBranchToSet) {
        setActiveBranchRole(roles[activeBranchToSet.id] || null)
      } else {
        setActiveBranchRole(null)
      }

    } catch (error) {
      console.error('Erreur lors du chargement des branches utilisateur:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id, user?.publicMetadata?.branch, user?.publicMetadata?.activeBranchId])

  // Migration depuis Clerk metadata
  const migrateFromLegacyBranch = async (userId: string, legacyBranchName: string) => {
    try {
      const response = await fetch('/api/user/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la migration')
      }

      const result = await response.json()
      console.log('Migration legacy effectuée avec succès:', result.message)
    } catch (error) {
      console.error('Erreur lors de la migration legacy:', error)
    }
  }

  // Changer la branche active
  const setActiveBranch = async (branch: Branch) => {
    setActiveBranchState(branch)

    try {
      // Mettre à jour via l'API
      const response = await fetch('/api/user/active-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ branchId: branch.id }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la branche active')
      }

      const data = await response.json()
      setActiveBranchRole(data.role || null)

    } catch (error) {
      console.error('Erreur lors du changement de branche:', error)
      // En cas d'erreur, on garde quand même la branche sélectionnée localement
    }
  }

  // Vérifier si l'utilisateur a accès à une branche
  const hasAccessToBranch = (branchId: string): boolean => {
    return userBranches.some(branch => branch.id === branchId)
  }

  // Vérifier si l'utilisateur est admin sur la branche active
  const isAdmin = (): boolean => {
    return activeBranchRole === 'admin'
  }

  useEffect(() => {
    if (isLoaded) {
      loadUserBranches()
    }
  }, [isLoaded, user?.id, loadUserBranches])

  const value: AuthContextType = useMemo(() => ({
    user,
    isLoaded,
    isSignedIn: !!isSignedIn,
    userBranches,
    activeBranch,
    activeBranchRole,
    setActiveBranch,
    hasAccessToBranch,
    isAdmin,
    isLoading,
  }), [user, isLoaded, isSignedIn, userBranches, activeBranch, activeBranchRole, setActiveBranch, isLoading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
import { randomBytes } from 'crypto';

export interface AppRegistration {
  appId: string;
  appName: string;
  appUrl: string;
  description: string;
  contactEmail: string;
  redirectUrls: string[];
  permissions: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface CreateAppRegistrationParams {
  appId: string;
  appName: string;
  appUrl: string;
  description: string;
  contactEmail: string;
  redirectUrls: string[];
  permissions: string[];
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
}

// In-memory app registration storage (replace with database in production)
const appRegistrationStore = new Map<string, AppRegistration>();

export async function generateAppId(): Promise<string> {
  // Generate a unique app ID
  const randomBytesBuffer = randomBytes(16);
  return `app_${randomBytesBuffer.toString('hex')}`;
}

export async function createAppRegistration(params: CreateAppRegistrationParams): Promise<AppRegistration> {
  const { appId, appName, appUrl, description, contactEmail, redirectUrls, permissions, status } = params;
  
  const registration: AppRegistration = {
    appId,
    appName,
    appUrl,
    description,
    contactEmail,
    redirectUrls,
    permissions,
    status,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Store registration in memory (replace with database in production)
  appRegistrationStore.set(appId, registration);

  return registration;
}

export async function getAppRegistration(appId: string): Promise<AppRegistration | null> {
  return appRegistrationStore.get(appId) || null;
}

export async function updateAppRegistration(
  appId: string, 
  updates: Partial<AppRegistration>
): Promise<AppRegistration | null> {
  const registration = appRegistrationStore.get(appId);
  
  if (!registration) {
    return null;
  }

  const updatedRegistration = {
    ...registration,
    ...updates,
    updatedAt: new Date()
  };

  appRegistrationStore.set(appId, updatedRegistration);
  return updatedRegistration;
}

export async function approveAppRegistration(
  appId: string, 
  approvedBy: string
): Promise<AppRegistration | null> {
  return await updateAppRegistration(appId, {
    status: 'approved',
    approvedAt: new Date(),
    approvedBy
  });
}

export async function rejectAppRegistration(
  appId: string, 
  rejectionReason: string
): Promise<AppRegistration | null> {
  return await updateAppRegistration(appId, {
    status: 'rejected',
    rejectionReason
  });
}

export async function suspendAppRegistration(
  appId: string, 
  reason: string
): Promise<AppRegistration | null> {
  return await updateAppRegistration(appId, {
    status: 'suspended',
    rejectionReason: reason
  });
}

export async function getAllAppRegistrations(): Promise<AppRegistration[]> {
  return Array.from(appRegistrationStore.values());
}

export async function getAppRegistrationsByStatus(status: AppRegistration['status']): Promise<AppRegistration[]> {
  return Array.from(appRegistrationStore.values()).filter(app => app.status === status);
}

export async function searchAppRegistrations(query: string): Promise<AppRegistration[]> {
  const searchTerm = query.toLowerCase();
  return Array.from(appRegistrationStore.values()).filter(app => 
    app.appName.toLowerCase().includes(searchTerm) ||
    app.description.toLowerCase().includes(searchTerm) ||
    app.contactEmail.toLowerCase().includes(searchTerm)
  );
}

export async function deleteAppRegistration(appId: string): Promise<boolean> {
  return appRegistrationStore.delete(appId);
}

// Utility functions
export function validateAppId(appId: string): boolean {
  // App IDs should start with 'app_' followed by 32 hex characters
  return /^app_[a-f0-9]{32}$/.test(appId);
}

export function validatePermissions(permissions: string[]): boolean {
  const validPermissions = ['read', 'write', 'admin', 'delete'];
  return permissions.every(permission => validPermissions.includes(permission));
}

export function getAppRegistrationStats(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
} {
  const apps = Array.from(appRegistrationStore.values());
  
  return {
    total: apps.length,
    pending: apps.filter(app => app.status === 'pending').length,
    approved: apps.filter(app => app.status === 'approved').length,
    rejected: apps.filter(app => app.status === 'rejected').length,
    suspended: apps.filter(app => app.status === 'suspended').length
  };
} 
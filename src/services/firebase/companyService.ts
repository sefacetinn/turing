/**
 * Company Firebase Service
 *
 * Firebase Firestore işlemleri için firma servisi
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './config';
import type {
  CompanyDocument,
  CompanyMemberDocument,
  CompanyInvitation,
  CompanyWithMembers,
  CompanyMemberWithUser,
  CreateCompanyParams,
  UpdateCompanyParams,
  InviteMemberParams,
  CompanyPermission,
  CompanyMemberRoleName,
  CompanyMemberStatus,
} from '../../types/company';
import { DEFAULT_COMPANY_ROLES, getCompanyRoleById } from '../../types/company';

// Collection names
const COMPANIES_COLLECTION = 'companies';
const COMPANY_MEMBERS_COLLECTION = 'company_members';
const COMPANY_INVITATIONS_COLLECTION = 'company_invitations';
const USERS_COLLECTION = 'users';

// ==================== COMPANY CRUD ====================

/**
 * Create a new company
 */
export async function createCompany(
  ownerId: string,
  ownerName: string,
  ownerEmail: string,
  params: CreateCompanyParams
): Promise<string> {
  const now = Timestamp.now();
  const companyId = `company_${ownerId}_${Date.now()}`;

  // Create company document
  const companyData: Omit<CompanyDocument, 'id'> = {
    name: params.name,
    type: params.type,
    logo: params.logo || '',
    phone: params.phone || '',
    email: params.email || ownerEmail,
    website: params.website || '',
    address: params.address || '',
    city: params.city || '',
    serviceCategories: params.serviceCategories || [],
    serviceRegions: params.serviceRegions || [],
    foundedYear: params.foundedYear || '',
    employeeCount: params.employeeCount || '',
    bio: params.bio || '',
    ownerId,
    createdAt: now,
    updatedAt: now,
    isVerified: false,
    isActive: true,
    stats: {
      totalEvents: 0,
      completedEvents: 0,
      totalOffers: 0,
      acceptedOffers: 0,
      rating: 0,
      reviewCount: 0,
    },
  };

  // Get owner role
  const ownerRole = DEFAULT_COMPANY_ROLES.find(r => r.id === 'owner')!;

  // Create owner as first member
  const memberId = `member_${ownerId}_${companyId}`;
  const memberData: Omit<CompanyMemberDocument, 'id'> = {
    companyId,
    userId: ownerId,
    roleId: ownerRole.id,
    roleName: ownerRole.name,
    permissions: ownerRole.permissions,
    status: 'active',
    invitedBy: ownerId,
    invitedAt: now,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  // Use batch write for atomicity
  const batch = writeBatch(db);

  // Add company
  batch.set(doc(db, COMPANIES_COLLECTION, companyId), companyData);

  // Add owner as member
  batch.set(doc(db, COMPANY_MEMBERS_COLLECTION, memberId), memberData);

  // Update user's companyIds
  batch.update(doc(db, USERS_COLLECTION, ownerId), {
    companyIds: arrayUnion(companyId),
    primaryCompanyId: companyId,
    updatedAt: now,
  });

  await batch.commit();

  return companyId;
}

/**
 * Get company by ID
 */
export async function getCompanyById(companyId: string): Promise<CompanyDocument | null> {
  const docSnap = await getDoc(doc(db, COMPANIES_COLLECTION, companyId));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as CompanyDocument;
  }
  return null;
}

/**
 * Get company with all members
 */
export async function getCompanyWithMembers(companyId: string): Promise<CompanyWithMembers | null> {
  const company = await getCompanyById(companyId);
  if (!company) return null;

  // Get members
  const membersQuery = query(
    collection(db, COMPANY_MEMBERS_COLLECTION),
    where('companyId', '==', companyId),
    where('status', '==', 'active')
  );
  const membersSnapshot = await getDocs(membersQuery);

  // Get member user details
  const members: CompanyMemberWithUser[] = [];
  for (const memberDoc of membersSnapshot.docs) {
    const memberData = memberDoc.data() as Omit<CompanyMemberDocument, 'id'>;
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, memberData.userId));
    const userData = userDoc.data();

    members.push({
      id: memberDoc.id,
      ...memberData,
      userName: userData?.displayName || userData?.name || 'Kullanıcı',
      userEmail: userData?.email || '',
      userImage: userData?.photoURL || userData?.userPhotoURL,
      userPhone: userData?.phone || userData?.phoneNumber,
    });
  }

  // Get pending invitations
  const invitationsQuery = query(
    collection(db, COMPANY_INVITATIONS_COLLECTION),
    where('companyId', '==', companyId),
    where('status', '==', 'pending')
  );
  const invitationsSnapshot = await getDocs(invitationsQuery);
  const pendingInvitations = invitationsSnapshot.docs.map(d => ({
    id: d.id,
    ...d.data(),
  })) as CompanyInvitation[];

  return {
    ...company,
    members,
    pendingInvitations,
  };
}

/**
 * Get companies for a user
 */
export async function getUserCompanies(userId: string): Promise<CompanyDocument[]> {
  // Get user's company IDs
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  const userData = userDoc.data();
  const companyIds = userData?.companyIds || [];

  if (companyIds.length === 0) return [];

  // Fetch each company
  const companies: CompanyDocument[] = [];
  for (const companyId of companyIds) {
    const company = await getCompanyById(companyId);
    if (company && company.isActive) {
      companies.push(company);
    }
  }

  return companies;
}

/**
 * Get user's primary company
 */
export async function getUserPrimaryCompany(userId: string): Promise<CompanyDocument | null> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  const userData = userDoc.data();
  const primaryCompanyId = userData?.primaryCompanyId;

  if (!primaryCompanyId) return null;

  return getCompanyById(primaryCompanyId);
}

/**
 * Update company
 */
export async function updateCompany(
  companyId: string,
  params: UpdateCompanyParams
): Promise<void> {
  const updateData: Record<string, any> = {
    ...params,
    updatedAt: Timestamp.now(),
  };

  // Remove undefined values
  Object.keys(updateData).forEach(key => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  await updateDoc(doc(db, COMPANIES_COLLECTION, companyId), updateData);
}

/**
 * Delete company (soft delete)
 */
export async function deleteCompany(companyId: string): Promise<void> {
  await updateDoc(doc(db, COMPANIES_COLLECTION, companyId), {
    isActive: false,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Set user's primary company
 */
export async function setUserPrimaryCompany(userId: string, companyId: string): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    primaryCompanyId: companyId,
    updatedAt: Timestamp.now(),
  });
}

// ==================== COMPANY MEMBERS ====================

/**
 * Get member by userId and companyId
 */
export async function getCompanyMember(
  companyId: string,
  userId: string
): Promise<CompanyMemberDocument | null> {
  const q = query(
    collection(db, COMPANY_MEMBERS_COLLECTION),
    where('companyId', '==', companyId),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CompanyMemberDocument;
}

/**
 * Get user's role in a company
 */
export async function getUserRoleInCompany(
  companyId: string,
  userId: string
): Promise<{ roleId: string; roleName: CompanyMemberRoleName; permissions: CompanyPermission[] } | null> {
  const member = await getCompanyMember(companyId, userId);
  if (!member || member.status !== 'active') return null;

  return {
    roleId: member.roleId,
    roleName: member.roleName,
    permissions: member.permissions,
  };
}

/**
 * Update member role
 */
export async function updateMemberRole(
  memberId: string,
  roleId: string
): Promise<void> {
  const role = getCompanyRoleById(roleId);
  if (!role) throw new Error('Geçersiz rol');

  await updateDoc(doc(db, COMPANY_MEMBERS_COLLECTION, memberId), {
    roleId: role.id,
    roleName: role.name,
    permissions: role.permissions,
    updatedAt: Timestamp.now(),
  });
}

/**
 * Remove member from company
 */
export async function removeMemberFromCompany(
  memberId: string,
  companyId: string,
  userId: string
): Promise<void> {
  const batch = writeBatch(db);

  // Delete member document
  batch.delete(doc(db, COMPANY_MEMBERS_COLLECTION, memberId));

  // Remove company from user's companyIds
  batch.update(doc(db, USERS_COLLECTION, userId), {
    companyIds: arrayRemove(companyId),
    updatedAt: Timestamp.now(),
  });

  // If this was user's primary company, clear it
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  const userData = userDoc.data();
  if (userData?.primaryCompanyId === companyId) {
    const remainingCompanies = (userData.companyIds || []).filter((id: string) => id !== companyId);
    batch.update(doc(db, USERS_COLLECTION, userId), {
      primaryCompanyId: remainingCompanies[0] || null,
    });
  }

  await batch.commit();
}

// ==================== INVITATIONS ====================

/**
 * Create invitation
 */
export async function createInvitation(
  params: InviteMemberParams,
  inviterId: string,
  inviterName: string,
  companyName: string
): Promise<string> {
  const role = getCompanyRoleById(params.roleId);
  if (!role) throw new Error('Geçersiz rol');

  const now = Timestamp.now();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 gün geçerli

  const invitationId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  const invitationData: Omit<CompanyInvitation, 'id'> = {
    companyId: params.companyId,
    companyName,
    email: params.email || '',
    phone: params.phone || '',
    roleId: role.id,
    roleName: role.name,
    invitedBy: inviterId,
    inviterName,
    message: params.message || '',
    status: 'pending',
    token,
    createdAt: now,
    expiresAt: Timestamp.fromDate(expiresAt),
  };

  await setDoc(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId), invitationData);

  // Send invitation email via Cloud Function
  try {
    const sendTeamInvitation = httpsCallable(functions, 'sendTeamInvitation');
    await sendTeamInvitation({
      email: params.email,
      inviterName,
      companyName,
      roleName: role.name,
      message: params.message,
      invitationToken: token,
    });
    console.log('[createInvitation] Invitation email sent successfully');
  } catch (emailError) {
    // Log but don't fail - invitation is still created
    console.warn('[createInvitation] Failed to send invitation email:', emailError);
  }

  return invitationId;
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<CompanyInvitation | null> {
  const q = query(
    collection(db, COMPANY_INVITATIONS_COLLECTION),
    where('token', '==', token),
    where('status', '==', 'pending')
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as CompanyInvitation;
}

/**
 * Accept invitation
 */
export async function acceptInvitation(
  invitationId: string,
  userId: string
): Promise<void> {
  const invDoc = await getDoc(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId));
  if (!invDoc.exists()) throw new Error('Davet bulunamadı');

  const invitation = invDoc.data() as Omit<CompanyInvitation, 'id'>;
  if (invitation.status !== 'pending') throw new Error('Davet artık geçerli değil');

  // Check expiration
  const expiresAt = invitation.expiresAt instanceof Timestamp
    ? invitation.expiresAt.toDate()
    : new Date(invitation.expiresAt);
  if (expiresAt < new Date()) throw new Error('Davetin süresi dolmuş');

  const now = Timestamp.now();
  const role = getCompanyRoleById(invitation.roleId);
  if (!role) throw new Error('Geçersiz rol');

  const batch = writeBatch(db);

  // Create member document
  const memberId = `member_${userId}_${invitation.companyId}`;
  const memberData: Omit<CompanyMemberDocument, 'id'> = {
    companyId: invitation.companyId,
    userId,
    roleId: role.id,
    roleName: role.name,
    permissions: role.permissions,
    status: 'active',
    invitedBy: invitation.invitedBy,
    invitedAt: invitation.createdAt,
    joinedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  batch.set(doc(db, COMPANY_MEMBERS_COLLECTION, memberId), memberData);

  // Update invitation status
  batch.update(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId), {
    status: 'accepted',
  });

  // Add company to user's companyIds
  batch.update(doc(db, USERS_COLLECTION, userId), {
    companyIds: arrayUnion(invitation.companyId),
    updatedAt: now,
  });

  // Set as primary if user has no primary company
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  const userData = userDoc.data();
  if (!userData?.primaryCompanyId) {
    batch.update(doc(db, USERS_COLLECTION, userId), {
      primaryCompanyId: invitation.companyId,
    });
  }

  await batch.commit();
}

/**
 * Reject invitation
 */
export async function rejectInvitation(invitationId: string): Promise<void> {
  await updateDoc(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId), {
    status: 'rejected',
  });
}

/**
 * Cancel invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
  await deleteDoc(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId));
}

/**
 * Resend invitation
 */
export async function resendInvitation(invitationId: string): Promise<void> {
  // Get existing invitation data
  const invDoc = await getDoc(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId));
  if (!invDoc.exists()) throw new Error('Davet bulunamadı');

  const invitation = invDoc.data() as Omit<CompanyInvitation, 'id'>;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // Generate new token
  const newToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  await updateDoc(doc(db, COMPANY_INVITATIONS_COLLECTION, invitationId), {
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromDate(expiresAt),
    token: newToken,
  });

  // Resend invitation email
  try {
    const sendTeamInvitation = httpsCallable(functions, 'sendTeamInvitation');
    await sendTeamInvitation({
      email: invitation.email,
      inviterName: invitation.inviterName,
      companyName: invitation.companyName,
      roleName: invitation.roleName,
      message: invitation.message,
      invitationToken: newToken,
    });
    console.log('[resendInvitation] Invitation email resent successfully');
  } catch (emailError) {
    console.warn('[resendInvitation] Failed to resend invitation email:', emailError);
  }
}

/**
 * Get pending invitations for user (by email or phone)
 */
export async function getUserPendingInvitations(
  email?: string,
  phone?: string
): Promise<CompanyInvitation[]> {
  const invitations: CompanyInvitation[] = [];

  if (email) {
    const emailQuery = query(
      collection(db, COMPANY_INVITATIONS_COLLECTION),
      where('email', '==', email),
      where('status', '==', 'pending')
    );
    const emailSnapshot = await getDocs(emailQuery);
    emailSnapshot.docs.forEach(d => {
      invitations.push({ id: d.id, ...d.data() } as CompanyInvitation);
    });
  }

  if (phone) {
    const phoneQuery = query(
      collection(db, COMPANY_INVITATIONS_COLLECTION),
      where('phone', '==', phone),
      where('status', '==', 'pending')
    );
    const phoneSnapshot = await getDocs(phoneQuery);
    phoneSnapshot.docs.forEach(d => {
      // Avoid duplicates
      if (!invitations.find(inv => inv.id === d.id)) {
        invitations.push({ id: d.id, ...d.data() } as CompanyInvitation);
      }
    });
  }

  return invitations;
}

// ==================== MIGRATION HELPERS ====================

/**
 * Migrate existing user to company structure
 * Creates a company from user's existing profile if they don't have one
 */
export async function migrateUserToCompany(userId: string): Promise<string | null> {
  // Check if user already has a company
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  const userData = userDoc.data();

  if (!userData) return null;

  // If user already has companies, skip
  if (userData.companyIds && userData.companyIds.length > 0) {
    return userData.primaryCompanyId || userData.companyIds[0];
  }

  // Determine company type based on user role
  let companyType: 'organizer' | 'provider' | 'dual' = 'organizer';
  if (userData.role === 'provider') {
    companyType = 'provider';
  } else if (userData.role === 'dual') {
    companyType = 'dual';
  }

  // Create company from user profile
  const companyId = await createCompany(
    userId,
    userData.displayName || 'Kullanıcı',
    userData.email || '',
    {
      name: userData.companyName || userData.displayName || 'Şirketim',
      type: companyType,
      logo: userData.photoURL || '',
      phone: userData.phone || userData.phoneNumber || '',
      email: userData.email || '',
      website: userData.website || '',
      address: userData.address || '',
      city: userData.city || '',
      serviceCategories: userData.providerServices || [],
      serviceRegions: userData.serviceRegions || [],
      foundedYear: userData.foundedYear || '',
      employeeCount: userData.employeeCount || '',
      bio: userData.bio || '',
    }
  );

  return companyId;
}

/**
 * Get company info for display (lightweight)
 */
export async function getCompanyDisplayInfo(
  companyId: string
): Promise<{ name: string; logo?: string } | null> {
  const company = await getCompanyById(companyId);
  if (!company) return null;
  return {
    name: company.name,
    logo: company.logo,
  };
}

/**
 * Get user's company info for offers/chat
 */
export async function getUserCompanyInfoForDisplay(
  userId: string
): Promise<{
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  userName: string;
  userRole?: string;
} | null> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  const userData = userDoc.data();
  if (!userData) return null;

  const primaryCompanyId = userData.primaryCompanyId;
  let companyInfo: { name: string; logo?: string } | null = null;
  let userRole: string | undefined;

  if (primaryCompanyId) {
    companyInfo = await getCompanyDisplayInfo(primaryCompanyId);
    const member = await getCompanyMember(primaryCompanyId, userId);
    userRole = member?.roleName;
  }

  return {
    companyId: primaryCompanyId,
    companyName: companyInfo?.name,
    companyLogo: companyInfo?.logo,
    userName: userData.displayName || 'Kullanıcı',
    userRole,
  };
}

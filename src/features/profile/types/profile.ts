export interface CollectorProfile {
  userId: string;
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  ensDomain: string;
  walletNickname: string;
  avatar: string | null;
  updatedAt: string;
}

export interface ProfileResponse {
  profile: CollectorProfile;
}

export interface UpdateProfileInput {
  displayName: string;
  username: string;
  email: string;
  ensName: string;
  ensDomain: string;
  walletNickname: string;
  avatar: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  changedAt: string;
}

export const ENS_DOMAINS = [".eth", ".xyz", ".nft"] as const;

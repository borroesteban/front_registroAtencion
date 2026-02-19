export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface RegistrationRequest {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  note?: string | null;
  status: RequestStatus;
  createdAt?: string;
}

export interface RegistrationRequestPayload {
  username: string;
  email?: string | null;
  password: string;
  firstName?: string | null;
  lastName?: string | null;
  note?: string | null;
}

export interface PermissionItem {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  appLabel?: string | null;
}

export interface NewPermissionPayload {
  code: string;
  name: string;
  appLabel?: string | null;
  description?: string | null;
}

export interface RoleItem {
  id: number;
  name: string;
  description?: string | null;
  permissions?: PermissionItem[];
  permissionIds?: number[];
}

export interface NewRolePayload {
  name: string;
  description?: string | null;
}

export interface UserItem {
  id: number;
  username: string;
  email?: string | null;
  isActive: boolean;
  roles?: RoleItem[];
  roleIds?: number[];
  permissions?: PermissionItem[];
  permissionIds?: number[];
}

export interface UserPermissionDetail {
  id: number;
  app_label: string;
  codename: string;
  name: string;
}

export interface UserRoleDetail {
  id: number;
  name: string;
}

export interface UserDetail {
  id: number;
  username: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  roles: UserRoleDetail[];
  direct_permissions: UserPermissionDetail[];
  group_permissions: UserPermissionDetail[];
}

export interface UserDetailResponse {
  user: UserDetail;
}

export interface DeleteUserResponse {
  message: string;
  user: { id: number; username: string };
}

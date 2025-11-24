import { IUser } from "../../models/User";

export interface CreateUserData {
  userId: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  provider?: string;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface UpdateUserData {
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  lastLoginAt?: Date;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface UserRepository {
  /**
   * Create a new user
   */
  createUser(data: CreateUserData): Promise<IUser>;

  /**
   * Get user by Firebase userId
   */
  getUserById(userId: string): Promise<IUser | null>;

  /**
   * Get user by email
   */
  getUserByEmail(email: string): Promise<IUser | null>;

  /**
   * Update user information
   */
  updateUser(userId: string, data: UpdateUserData): Promise<IUser | null>;

  /**
   * Update user's last login time
   */
  updateLastLogin(userId: string): Promise<IUser | null>;

  /**
   * Delete user
   */
  deleteUser(userId: string): Promise<boolean>;

  /**
   * Get all users (admin only - for testing)
   */
  getAllUsers(): Promise<IUser[]>;
}


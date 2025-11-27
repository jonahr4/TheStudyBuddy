import User, { IUser } from "../../models/User";
import { UserRepository, CreateUserData, UpdateUserData } from "./UserRepository";

export class MongoUserRepository implements UserRepository {
  async createUser(data: CreateUserData): Promise<IUser> {
    const user = await User.create({
      ...data,
      lastLoginAt: new Date(),
    });
    return user;
  }

  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findOne({ userId }).exec();
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email: email.toLowerCase() }).exec();
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true }
    ).exec();
  }

  async updateLastLogin(userId: string): Promise<IUser | null> {
    return await User.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          lastLoginAt: new Date(),
          'metadata.lastSignInTime': new Date().toISOString(),
        } 
      },
      { new: true }
    ).exec();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await User.deleteOne({ userId }).exec();
    return result.deletedCount > 0;
  }

  async getAllUsers(): Promise<IUser[]> {
    return await User.find().sort({ createdAt: -1 }).exec();
  }
}


export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio?: string;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

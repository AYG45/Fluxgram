export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  images: string[];
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: Date;
}

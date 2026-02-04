export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  is_read: boolean;
};

export type Conversation = {
  id: string;
  buyer_id: string;
  seller_id: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  }[];
  last_message?: {
    content: string | null;
    image_url: string | null;
    created_at: string;
  };
  unread_count?: number;
};

export type ChatUser = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};
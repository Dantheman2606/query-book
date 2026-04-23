import { apiRequest } from '@/lib/apiClient';
import type { Reply, CreateReplyPayload } from '@/types/frontend';

export interface ReplyVoteResponse {
  message: string;
  replyId: string;
  upvotes: number;
  downvotes: number;
  userVote: 'UPVOTE' | 'DOWNVOTE' | null;
}

export async function getReplies(queryId: string): Promise<{ replies: Reply[] }> {
  return apiRequest<{ replies: Reply[] }>(`/replies/${queryId}/replies`);
}

export async function createReply(payload: CreateReplyPayload): Promise<{ reply: Reply }> {
  return apiRequest<{ reply: Reply }>(`/queries/${payload.queryId}/reply`, {
    method: 'POST',
    body: payload,
  });
}

export async function createReplyToReply(queryId: string, payload: CreateReplyPayload) {
  return apiRequest(`/replies/${queryId}/reply-to-reply`, {
    method: 'POST',
    body: payload,
  });
}

export async function upvoteReply(replyId: string) {
  return apiRequest<ReplyVoteResponse>(`/replies/${replyId}/upvote`, { method: 'PUT' });
}

export async function downvoteReply(replyId: string) {
  return apiRequest<ReplyVoteResponse>(`/replies/${replyId}/downvote`, { method: 'PUT' });
}

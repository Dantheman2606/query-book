import { db } from '@/lib/db';
import { VoteType } from '@prisma/client';

interface VoteResult {
  queryId?: string;
  replyId?: string;
  upvotes: number;
  downvotes: number;
  userVote: VoteType | null;
}

/**
 * Toggle upvote on a query
 */
export async function toggleQueryUpvote(
  queryId: string,
  userId: string
): Promise<VoteResult> {
  const query = await db.query.findUnique({
    where: { id: queryId },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  // Check existing vote
  const existingVote = await db.vote.findUnique({
    where: {
      userId_queryId: {
        userId,
        queryId,
      },
    },
  });

  let upvotes = query.upvotes;
  let downvotes = query.downvotes;
  let userVote: VoteType | null = null;

  if (existingVote) {
    if (existingVote.type === 'UPVOTE') {
      // Remove upvote
      await db.vote.delete({
        where: {
          userId_queryId: {
            userId,
            queryId,
          },
        },
      });
      upvotes = Math.max(0, upvotes - 1);
    } else {
      // Change downvote to upvote
      await db.vote.update({
        where: {
          userId_queryId: {
            userId,
            queryId,
          },
        },
        data: { type: 'UPVOTE' },
      });
      downvotes = Math.max(0, downvotes - 1);
      upvotes = Math.min(upvotes + 1, upvotes + 1);
      userVote = 'UPVOTE';
    }
  } else {
    // Add new upvote
    await db.vote.create({
      data: {
        type: 'UPVOTE',
        userId,
        queryId,
      },
    });
    upvotes = upvotes + 1;
    userVote = 'UPVOTE';
  }

  // Update query vote counts
  await db.query.update({
    where: { id: queryId },
    data: { upvotes, downvotes },
  });

  return {
    queryId,
    upvotes,
    downvotes,
    userVote,
  };
}

/**
 * Toggle downvote on a query
 */
export async function toggleQueryDownvote(
  queryId: string,
  userId: string
): Promise<VoteResult> {
  const query = await db.query.findUnique({
    where: { id: queryId },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  // Check existing vote
  const existingVote = await db.vote.findUnique({
    where: {
      userId_queryId: {
        userId,
        queryId,
      },
    },
  });

  let upvotes = query.upvotes;
  let downvotes = query.downvotes;
  let userVote: VoteType | null = null;

  if (existingVote) {
    if (existingVote.type === 'DOWNVOTE') {
      // Remove downvote
      await db.vote.delete({
        where: {
          userId_queryId: {
            userId,
            queryId,
          },
        },
      });
      downvotes = Math.max(0, downvotes - 1);
    } else {
      // Change upvote to downvote
      await db.vote.update({
        where: {
          userId_queryId: {
            userId,
            queryId,
          },
        },
        data: { type: 'DOWNVOTE' },
      });
      upvotes = Math.max(0, upvotes - 1);
      downvotes = downvotes + 1;
      userVote = 'DOWNVOTE';
    }
  } else {
    // Add new downvote
    await db.vote.create({
      data: {
        type: 'DOWNVOTE',
        userId,
        queryId,
      },
    });
    downvotes = downvotes + 1;
    userVote = 'DOWNVOTE';
  }

  // Update query vote counts
  await db.query.update({
    where: { id: queryId },
    data: { upvotes, downvotes },
  });

  return {
    queryId,
    upvotes,
    downvotes,
    userVote,
  };
}

/**
 * Get user's vote on a query
 */
export async function getQueryVote(
  queryId: string,
  userId: string
): Promise<VoteType | null> {
  const vote = await db.vote.findUnique({
    where: {
      userId_queryId: {
        userId,
        queryId,
      },
    },
  });

  return vote?.type || null;
}

/**
 * Toggle upvote on a reply
 */
export async function toggleReplyUpvote(
  replyId: string,
  userId: string
): Promise<VoteResult> {
  const reply = await db.reply.findUnique({
    where: { id: replyId },
  });

  if (!reply) {
    throw new Error('Reply not found');
  }

  // Check existing vote
  const existingVote = await db.replyVote.findUnique({
    where: {
      userId_replyId: {
        userId,
        replyId,
      },
    },
  });

  let netVotes = reply.netVotes;
  let userVote: VoteType | null = null;

  if (existingVote) {
    if (existingVote.type === 'UPVOTE') {
      // Remove upvote
      await db.replyVote.delete({
        where: {
          userId_replyId: {
            userId,
            replyId,
          },
        },
      });
      netVotes = Math.max(-1, netVotes - 1);
    } else {
      // Change downvote to upvote
      await db.replyVote.update({
        where: {
          userId_replyId: {
            userId,
            replyId,
          },
        },
        data: { type: 'UPVOTE' },
      });
      netVotes = netVotes + 2;
      userVote = 'UPVOTE';
    }
  } else {
    // Add new upvote
    await db.replyVote.create({
      data: {
        type: 'UPVOTE',
        userId,
        replyId,
      },
    });
    netVotes = netVotes + 1;
    userVote = 'UPVOTE';
  }

  // Update reply vote count
  await db.reply.update({
    where: { id: replyId },
    data: { netVotes },
  });

  return {
    replyId,
    upvotes: netVotes > 0 ? netVotes : 0,
    downvotes: netVotes < 0 ? Math.abs(netVotes) : 0,
    userVote,
  };
}

/**
 * Toggle downvote on a reply
 */
export async function toggleReplyDownvote(
  replyId: string,
  userId: string
): Promise<VoteResult> {
  const reply = await db.reply.findUnique({
    where: { id: replyId },
  });

  if (!reply) {
    throw new Error('Reply not found');
  }

  // Check existing vote
  const existingVote = await db.replyVote.findUnique({
    where: {
      userId_replyId: {
        userId,
        replyId,
      },
    },
  });

  let netVotes = reply.netVotes;
  let userVote: VoteType | null = null;

  if (existingVote) {
    if (existingVote.type === 'DOWNVOTE') {
      // Remove downvote
      await db.replyVote.delete({
        where: {
          userId_replyId: {
            userId,
            replyId,
          },
        },
      });
      netVotes = Math.min(1, netVotes + 1);
    } else {
      // Change upvote to downvote
      await db.replyVote.update({
        where: {
          userId_replyId: {
            userId,
            replyId,
          },
        },
        data: { type: 'DOWNVOTE' },
      });
      netVotes = netVotes - 2;
      userVote = 'DOWNVOTE';
    }
  } else {
    // Add new downvote
    await db.replyVote.create({
      data: {
        type: 'DOWNVOTE',
        userId,
        replyId,
      },
    });
    netVotes = netVotes - 1;
    userVote = 'DOWNVOTE';
  }

  // Update reply vote count
  await db.reply.update({
    where: { id: replyId },
    data: { netVotes },
  });

  return {
    replyId,
    upvotes: netVotes > 0 ? netVotes : 0,
    downvotes: netVotes < 0 ? Math.abs(netVotes) : 0,
    userVote,
  };
}

/**
 * Get user's vote on a reply
 */
export async function getReplyVote(
  replyId: string,
  userId: string
): Promise<VoteType | null> {
  const vote = await db.replyVote.findUnique({
    where: {
      userId_replyId: {
        userId,
        replyId,
      },
    },
  });

  return vote?.type || null;
}

/**
 * Get votes for a query
 */
export async function getQueryVotes(queryId: string): Promise<{
  upvotes: number;
  downvotes: number;
}> {
  const query = await db.query.findUnique({
    where: { id: queryId },
    select: {
      upvotes: true,
      downvotes: true,
    },
  });

  if (!query) {
    throw new Error('Query not found');
  }

  return {
    upvotes: query.upvotes,
    downvotes: query.downvotes,
  };
}

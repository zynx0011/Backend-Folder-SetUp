import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video
  const video = await Video.findOne({ _id: videoId });

  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  let isLiked = false;
  let likeCount = 0;
  const toggleLike = () => {
    isLiked !== isLiked;
  };

  if (!toggleLike) {
    throw new ApiError(400, "error while liking video");
  }

  const alreadyLiked = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ video: videoId, likedBy: req.user._id });
  }

  if (!alreadyLiked) {
    const newLike = await Like.create({
      video: videoId,
      likedBy: req.user._id,
    });
    if (newLike) {
      likeCount += 1;
      isLiked = true;
    }
  } else {
    isLiked = false;
    likeCount = likeCount - 1;
  }

  // const like = await Like.aggregate([
  //   {
  //     $match: {
  //       video: video._id,
  //     },
  //   },
  //   {
  //     $lookup: {
  //       from: "likes",
  //       localField: "_id",
  //       foreignField: "videoFiles",
  //       as: "liked",
  //       pipeline: [
  //         {
  //           $addFields: {
  //             likesCount: {
  //               $size: "$liked",
  //             },
  //           },
  //         },
  //         {
  //           $project: {
  //             video: 1,
  //             likeCount: 1,
  //           },
  //         },
  //       ],
  //     },
  //   },
  // ]);

  // if (like) {
  //   toggleLike();
  // }

  // if (!like) {
  //   throw new ApiError(400, "error while liked video");
  // }

  const data = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data },
        { isLiked, likeCount },
        "successfully liked video"
      )
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  //TODO: toggle like on comment

  const comment = await Comment.findOne({ _id: commentId });

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  let isLiked = false;
  let likeCount = 0;
  const toggleLike = () => {
    isLiked !== isLiked;
  };

  if (!toggleLike) {
    throw new ApiError(400, "error while liking video");
  }

  const alreadyLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ comment: commentId, likedBy: req.user._id });
  }

  if (!alreadyLiked) {
    const newLike = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });
    if (newLike) {
      likeCount += 1;
      isLiked = true;
    }
  } else {
    isLiked = false;
    likeCount = likeCount - 1;
  }

  const data = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data },
        { isLiked, likeCount },
        "successfully liked comment"
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  //TODO: toggle like on tweet

  const tweet = await Tweet.findOne({ _id: tweetId });

  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  let isLiked = false;
  let likeCount = 0;
  const toggleLike = () => {
    isLiked !== isLiked;
  };

  if (!toggleLike) {
    throw new ApiError(400, "error while liking video");
  }

  const alreadyLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (alreadyLiked) {
    await Like.deleteOne({ tweet: tweetId, likedBy: req.user._id });
  }

  if (!alreadyLiked) {
    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    if (newLike) {
      likeCount += 1;
      isLiked = true;
    }
  } else {
    isLiked = false;
    likeCount = likeCount - 1;
  }

  const data = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data },
        { isLiked, likeCount },
        "successfully liked comment"
      )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
  const response = await Like.aggregate([
    {
      $lookup: {
        from: "likes",
        localField: "video",
        foreignField: "_id",
        as: "liked video",
        pipeline: [
          {
            $project: {
              _id: 1,
              video: 1,
              likedBy: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!response) {
    throw new ApiError(404, "liked videos not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { data: response }, "successfully got liked videos")
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };

import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

// const getVideoComments = asyncHandler(async (req, res) => {
//   //TODO: get all comments for a video
//   const { videoId } = req.params;
//   const { page = 1, limit = 10 } = req.query;
// });
const getVideoComments = asyncHandler(async (req, res) => {
  // TODO: get all comments for a video
  const { videoId } = req.params;
  //   const { page = 1, limit = 10 } = req.query;

  //   try {
  //     // Find the video by its ID
  //     const video = await Video.findOne({ _id: videoId });

  //     if (!video) {
  //       throw new ApiError(404, "Video not found");
  //     }

  //     // Extract comments from the video
  //     const comments = (await Video?.content) || [];

  //     // Paginate the comments
  //     const startIndex = (page - 1) * limit;
  //     const endIndex = page * limit;
  //     const paginatedComments = comments.slice(startIndex, endIndex);

  //     // Respond with the paginated comments
  //     res.status(200).json({
  //       comments: paginatedComments,
  //       totalComments: comments.length,
  //       currentPage: parseInt(page),
  //       totalPages: Math.ceil(comments.length / limit),
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res
  //       .status(error.statusCode || 500)
  //       .json({ error: error.message || "Internal Server Error" });
  //   }

  const video = await Video.findOne({ _id: videoId });

  if (!video) {
    throw new ApiError(404, " video Not Found");
  }

  const CommentedVideo = await Comment.aggregate([
    {
      $match: {
        video: video._id,
      },
    },

    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "videoFile",
        as: "comments",
        pipeline: [
          {
            $project: {
              video: 1,
              owner: 1,
              content: 1,
            },
          },
        ],
      },
    },
  ]);

  if (!CommentedVideo.length) {
    throw new ApiError(404, "video has not comments");
  }
  console.log("Comments", CommentedVideo);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        CommentedVideo,
        "successfully got video with comment"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { comment } = req.body;
  const { videoId } = req.params;

  if (!comment.length) {
    throw new ApiError(100, "please enter a comment");
  }

  const owner = await User.findById(req.user?.id);
  const video = await Video.findOne({ _id: videoId });
  const comments = await Comment.create({
    content: comment,
    owner,
    video,
  });

  if (!comments) {
    throw new ApiError(400, "error while creating comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "comment created"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { updatedComment } = req.body;

  if (!updatedComment.length) {
    throw new ApiError(404, "please enter comment");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId },
    {
      $set: {
        content: updatedComment,
      },
    },
    {
      new: true,
    }
  );

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;

  if (!commentId.length) {
    throw new ApiError(404, "comment not found");
  }

  const comment = await Comment.deleteOne({ _id: commentId });

  if (!comment) {
    throw new ApiError(400, "error while deleting comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };

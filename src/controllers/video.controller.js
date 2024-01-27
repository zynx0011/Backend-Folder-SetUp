import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const conditions = {};
  if (query) {
    conditions.title = { $regex: new RegExp(query, "i") };
  }
  if (userId) {
    conditions.userId = userId;
  }

  try {
    // Construct the base query
    const videoQuery = Video.find(conditions);

    // Apply sorting if sortBy is provided
    if (sortBy) {
      const sortOptions = {};
      sortOptions[sortBy] = sortType === "desc" ? -1 : 1;
      videoQuery.sort(sortOptions);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    videoQuery.skip(skip).limit(parseInt(limit));

    // Execute the query
    const videos = await videoQuery.exec();

    // Optionally, you can also get the total count of videos for pagination purposes
    const totalCount = await Video.countDocuments(conditions);

    // Send the response
    res.status(200).json({
      videos,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { videoFile, title, description, thumbnail } = req.body;
  console.log("this is an erro", req.files?.video[0]?.path);

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // const videoUpload = await req.files?.video[0]?.path;

  let videoUpload;
  if (
    req.files &&
    Array.isArray(req.files.video) &&
    req.files.video.length > 0
  ) {
    videoUpload = req.files.video[0].path;
  }
  const thumbnailUpload = await req.files?.thumbnail[0]?.path;

  if (!videoUpload) {
    throw new ApiError(400, "video file is required");
  }

  const Thumbnail = await uploadOnCloudinary(thumbnailUpload);
  const videos = await uploadOnCloudinary(videoUpload);

  if (!videos) {
    throw new ApiError(400, "error while uploading video on cloudinary");
  }
  if (!Thumbnail) {
    throw new ApiError(400, "error while uploading thumbnail on cloudinary");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videos.url,
    thumbnail: Thumbnail.url,
    duration: Math.ceil(videos.duration) / 60,
  });

  const vid = await Video.findById(video._id);
  console.log("this is id", vid);
  if (!vid) {
    throw new ApiError(500, "Something went wrong ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video was successfully uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id

  if (!videoId) {
    throw new ApiError(400, "please provide video id");
  }

  const video = await Video.findById({ _id: videoId });
  console.log("this is video id", video);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "video fetched succssesfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { title } = req.params;
  //TODO: update video details like title, description, thumbnail

  const { newTitle, description, thumbnail } = req.body;

  if ([title, newTitle, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (!title) {
    throw new ApiError(400, " title is required");
  }

  const thumbnailLocalPath = req.file?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  //TODO: delete old image - assignment

  const newThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!newThumbnail.url) {
    throw new ApiError(400, "Error while uploading on newThumbnail");
  }

  const video = await Video.findOneAndUpdate(
    { title: title },
    {
      $set: {
        title: newTitle,
        description,
        thumbnail: newThumbnail.url,
      },
    },
    { new: true }
  ).select("-refreshToken ");

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { video }, "all details are updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (videoId > 0) {
    throw new ApiError(400, "please provide video id");
  }
  const video = await Video.deleteOne({ _id: videoId });

  console.log("id", video);
  console.log("params", videoId);
  console.log("clg", req.video?._id);

  if (!video) {
    throw new ApiError(400, " video not found ");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const video = await Video.findOne({ _id: videoId });

  video.isPublished = !video.isPublished;

  if (video.isPublished == false) {
  }

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "togglePublishStatus done successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// the following controllers are for publishing and uploading video like youtube videos

const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  console.log("this is an erro", req.files?.video[0]?.path);

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const videoUpload = await req.files?.video[0]?.path;
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

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video was successfully uploaded"));
});

export { uploadVideo };

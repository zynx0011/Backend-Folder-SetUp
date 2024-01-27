import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { text } = req.body;

  if (!text || text.length === 0) {
    throw new ApiError(100, "text is required");
  }

  const tweet = await Tweet.create({
    content: text,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiError(400, "error while creating tweet");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "tweet created"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const tweets = await Tweet.find({ owner: userId });

  if (!tweets) {
    throw new ApiError(404, "tweets not found");
  }

  return res.status(200).json(new ApiResponse(200, tweets, "tweets found"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { text } = req.body;

  const tweet = await Tweet.findOneAndUpdate(
    { _id: tweetId } || isValidObjectId(tweetId),
    {
      $set: {
        content: text,
      },
    }
  );

  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "tweet updated"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;

  const tweet = await Tweet.deleteOne({ _id: tweetId });

  if (!tweet) {
    throw new ApiError(404, "tweet not found");
  }

  return res.status(200).json(new ApiResponse(200, tweet, "tweet deleted"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };

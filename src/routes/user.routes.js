import { Router } from "express";
import {
  changeCurrentUserPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutuser,
  refreshAccessToken,
  registerUser,
  updateAccoutDetails,
  updateUserAvatar,
  updateUserCoverImage,
  updateUserName,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyjwt, logoutuser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyjwt, changeCurrentUserPassword);

router.route("/current-user").get(verifyjwt, getCurrentUser);

router.route("/update-username").patch(verifyjwt, updateUserName);

router.route("/update-account").post(verifyjwt, updateAccoutDetails); // patch is used for single update

router
  .route("/avatar")
  .patch(verifyjwt, upload.single("avatar"), updateUserAvatar);

router
  .route("/cover-image")
  .patch(verifyjwt, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyjwt, getUserChannelProfile);

router.route("/history").get(verifyjwt, getWatchHistory);

// routes for video

export default router;

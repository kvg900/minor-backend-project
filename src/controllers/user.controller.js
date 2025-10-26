import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend(using postman)
  // validation of user(not empty)
  // check if user already exist(here you can use username and email for this purpose)
  // check for images,check for avatar
  // if images are available then send them to cloudinary
  //create user object- create entry in DB
  // remove password and refresh token field from response
  //check for user creation
  //return res

  //step 1: getting user details from frontend
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  // if (fullname === "") {
  //   throw new ApiError(400,"Fullname is required");
  // }

  //step 2: checking for emptiness
  if ([fullname, email, username, password].some(() => field?.trim() === "")) {
    throw new ApiError(400, "All fiels are compulsary");
  }

  //step 3: checking if user details already exist
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exist");
  }

  //step 4: check for images and avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar image is required");
  }

  //step 5: uploading the images if available to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file required");
  }

  //step 6: creating user object
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //step 7: check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong hil registering the user");
  }

  //step 8: returning response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };

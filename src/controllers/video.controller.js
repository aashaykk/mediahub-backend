import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required!")

    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required!")
    }

    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!video?.url) {
        throw new ApiError(400, "Error uploading video to cloud")
    }
     if (!thumbnail?.url) {
        throw new ApiError(400, "Error uploading video to cloud")
    }

    const uploadedVideo = await Video.create({
        videoFile: video.url,
        title,
        description,
        thumbnail: thumbnail.url,
        duration: video.duration,
        owner: req.user._id
    })

    if (!uploadedVideo) {
        throw new ApiError(500, "Failed to save video data")
    }
    return res.status(201).json(
        new ApiResponse(201, uploadedVideo, "Video published successfully!")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.video,
            "Video fetched successfully!"
        )
    )

})

const updateVideoDetails = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description} = req.body

    if (!title || !description) {
        throw new ApiError(400, "All fields are required!")
    }
    //TODO: update video details like title, description, thumbnail

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description
            }
        },
        {new : true}
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully"))

    
})

const updateVideoThumbnail = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const thumbnailLocalPath = req.file?.path

    if(!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail File is missing")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!thumbnail.url) {
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: thumbnail.url,
            }
        },
        {new : true}
    )

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {video}, "Thumbnail Updated Successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideoDetails,
    updateVideoThumbnail,
    deleteVideo,
    togglePublishStatus
}
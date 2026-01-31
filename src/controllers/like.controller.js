import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    if(!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    const like = await Like.findOne({ video: videoId, likedBy: req.user._id })

    let isLiked

    if(like) {
        //already liked so unlike it therefore delete the document
        await Like.findByIdAndDelete(like._id)
        isLiked = false
    } else {
        //not liked to toggle it true
        await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        isLiked = true
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isLiked},
            isLiked ? "Video liked successfully" : "Video unliked successfully"
        )
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId) {
        throw new ApiError(400, "Comment id is required")
    }

    const comment = await Comment.findById(commentId)

    if(!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const like = await Like.findOne({ comment: commentId, likedBy: req.user._id })

    let isLiked

    if(like) {
        //already liked so unlike it therefore delete the document
        await Like.findByIdAndDelete(like._id)
        isLiked = false
    } else {
        //not liked to toggle it true
        await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        isLiked = true
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isLiked},
            isLiked ? "Comment liked successfully" : "Comment unliked successfully"
        )
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user._id
    })

    let isLiked

    if (like) {
        await Like.findByIdAndDelete(like._id)
        isLiked = false
    } else {
        await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        isLiked = true
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { isLiked },
            isLiked ? "Tweet liked successfully" : "Tweet unliked successfully"
        )
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const likedVideoLikes = await Like.find({
        likedBy: userId,
        video: { $ne: null }
    })
        .sort({ createdAt: -1 }) 
        .skip(skip)
        .limit(limit)
        .populate({
            path: "video",
            select: "-__v"
        })

    const videos = likedVideoLikes
        .map(like => like.video)
        .filter(video => video !== null)

    const totalLikes = await Like.countDocuments({
        likedBy: userId,
        video: { $ne: null }
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                videos,
                page,
                limit,
                totalLikes,
                totalPages: Math.ceil(totalLikes / limit)
            },
            "Liked videos fetched successfully"
        )
    )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
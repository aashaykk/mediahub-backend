import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    
    if(!videoId) {
        throw new ApiError(400, "Video Id is required")
    }
    
    page = Number(page)
    limit = Number(limit)

    if(isNaN(page) || page < 1) {
        page = 1
    }

    if(isNaN(limit) || limit < 1) {
        limit = 10
    }

    const skip = (page - 1)*limit

    const comments = await Comment.find({ video: videoId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

    if(!comments) {
        throw new ApiError(404, "Comments not found")
    }
    
    const totalComments = await Comment.countDocuments({ video: videoId })

    const totalPages = Math.ceil(totalComments / limit);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                comments,
                currentPage: page,
                totalPages,
                totalComments
            },
            "Comments fetched successfully"
        )
    )


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if(!videoId) {
        throw new ApiError(400, "Video Id is required")
    }
    
    const video = await Video.findById(videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(!content) {
        throw new ApiError(400, "Content forr the comment is required")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            comment,
            "Comment added successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params
  const { newContent } = req.body

  if (!commentId) {
    throw new ApiError(400, "Invalid comment ID")
  }

  if (!newContent) {
    throw new ApiError(400, "Comment content cannot be empty")
  }

  const comment = await Comment.findById(commentId)

  if (!comment) {
    throw new ApiError(404, "Comment not found")
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this comment")
  }

  comment.content = newContent.trim()
  await comment.save()

  return res.status(200).json(
    new ApiResponse(
      200,
      comment,
      "Comment updated successfully"
    )
  )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if(!commentId) {
        throw new ApiError(400, "Invalid Comment Id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
    throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this comment")
    }

    await comment.deleteOne()

    return res.
    status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }
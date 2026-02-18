import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriberId = req.user._id
    // TODO: toggle subscription

    if(!channelId) {
        throw new ApiError(400, "Invalid Channel Id")
    }

    if(subscriberId.toString() == channelId) {
        throw new ApiError(400, "You cannot subscribe to yourself")
    }

    const channel = await User.findById(channelId)

    if(!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if(existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscrption._id)
    }

    await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            existingSubscription? "Unsubscribed Successfully": "Subscribed Successfully"
        )
    )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const channelExists = await User.findById(channelId)
    if (!channelExists) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users", 
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },
        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                _id: "$subscriber._id",
                username: "$subscriber.username",
                email: "$subscriber.email",
                avatar: "$subscriber.avatar"
            }
        }
    ])
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers: subscribers.length,
                subscribers
            },
            "Subscribers fetched successfully"
        )
    )
})


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const userExists = await User.findById(subscriberId)
    if (!userExists) {
        throw new ApiError(404, "User not found")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                _id: "$channel._id",
                username: "$channel.username",
                email: "$channel.email",
                avatar: "$channel.avatar"
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribedChannels: subscribedChannels.length,
                subscribedChannels
            },
            "Subscribed channels fetched successfully"
        )
    )
})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
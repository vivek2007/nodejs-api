const User = require('../models/user.model')
const Category = require('../models/category.model')
const Comment = require('../models/comment.model')
const Subcomment = require('../models/subcomment.model')
const Reply = require('../models/reply.model')
const Blog = require('../models/blog.model')
const AuthController = require('../controllers/auth.controller')
const mongoose = require("mongoose")

let isValidUser = async (userID) => {
	try
	{
		return new Promise(async resolve => {
			let user = await User.findOne({_id:userID},{email:1}).exec()
			if(user)
			{
				return resolve(1)
			}
			else
			{
				return resolve(0)
			}
		})
	}
	catch (error) 
	{
		console.log(`In catch error: ${error.message}`)
	}
}	

let getCategoryName = async (categoryID) => {
	try
	{
		return new Promise(async resolve => {
			let category = await Category.findOne({_id:categoryID},{name:1}).exec()
			if(category)
			{
				return resolve(category.name)
			}
			else
			{
				return resolve("")
			}
		})
	}
	catch (error) 
	{
		console.log(`In catch error: ${error.message}`)
	}
}	

exports.getCategories = async (req, res) => {
	try 
	{
		let categories = await Category.find({}).exec()
		return res.status(200).json({
			status: 1,
			message: `Categories found`,
			categories
		})
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.createPost = async (req,res) => {
	try 
	{
		let { title, userID, type, categoryID, description } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let categoryName = await getCategoryName(categoryID)
			if(categoryName.trim().length)
			{
				Blog.create(req.body).then(async post => {
					post = JSON.parse(JSON.stringify(post))
					post.categoryName = categoryName
					return res.status(200).json({
						status: 1,
						message: `Post created succesfully`,
						postDetails:post
					})
				})
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Category not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.updatePost = async (req,res) => {
	try 
	{
		let { title, userID, postID, type, categoryID, description } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let post = await Blog.findOne({_id:postID,isDeleted:false},{ commentsCount:1 }).exec()
			if(post)
			{
				let categoryName = await getCategoryName(categoryID)
				if(categoryName.trim().length)
				{
					await Blog.updateOne({_id:postID},{$set:{ title:title, type:type, categoryID:categoryID, description:description }}).exec()
					return res.status(200).json({
						status: 1,
						message: `Post updated succesfully`
					})
				}
				else
				{
					return res.status(404).json({
						status: 0,
						message: `Category not found`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Post not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.getPosts = async (req,res) => {
	try 
	{
		let { userID, min, max, searchKey } = req.body
		searchKey = searchKey.trim()
		let flag = 1
		let userDetails = {}
		if(userID)
		{
			flag = 0
			let validUser = await isValidUser(userID)
			if(validUser)
			{
				flag = 1
			}
		}
		if(flag == 0)
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
		else
		{
			let query = { isDeleted:false }
			if(userID)
			{
				query = { userID:userID, isDeleted:false }
			}
			if(searchKey.length)
			{
				query['title'] = {$regex:`.*${searchKey}.*`,$options:"i"}
			}
			const totalPosts = await Blog.find(query,{userID:1,type:1,categoryID:1,title:1,description:1,createdAt:1,blogNumber:1}).countDocuments()
			if(totalPosts)
			{
				let blogs = await Blog.find(query,{userID:1,type:1,categoryID:1,title:1,description:1,createdAt:1,blogNumber:1,commentsCount:1}).sort({_id:-1}).skip(min).limit(max).exec()
				let blogsLength = blogs.length
				let posts = []
				for(let i=0;i<blogsLength;i++)
				{
					let blog = JSON.parse(JSON.stringify(blogs[i]))
					if(userID)
					{
						if(i == 0)
						{
							userDetails = blog.userDetails = await AuthController.getUserDetails(blog.userID)
						}
						else
						{
							blog.userDetails = userDetails
						}
					}
					else
					{
						blog.userDetails = await AuthController.getUserDetails(blog.userID)
					}
					blog.categoryName = await getCategoryName(blog.categoryID)
					posts.push(blog)
					if(i==(blogsLength - 1))
					{
						return res.status(200).json({
							status: 1,
							message: `Posts found`,
							totalPosts,
							posts
						})
					}
				}
			}
			else
			{
				return res.status(200).json({
					status: 0,
					message: `No Posts found`,
					totalPosts:0,
					posts:[]
				})
			}
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

let getReplies = async (commentID) => {
	try
	{
		return new Promise(async resolve => {
			let replies = await Reply.find({ commentID:commentID, isDeleted:false },{ comment:1,createdAt:1 }).exec()
			return resolve(replies)
		})
	}
	catch (error) 
	{
		console.log(`In getComments main catch error: ${error.message}`)
	}
}

let getComments = async (postID) => {
	try
	{
		return new Promise(async resolve => {
			let comments = []
			let postComments = await Comment.find({ postID:postID, isDeleted:false }, { comment:1,createdAt:1 }).exec()
			if(postComments)
			{
				let totalComments = postComments.length
				for(let i=0;i<totalComments;i++)
				{
					let comment = JSON.parse(JSON.stringify(postComments[i]))
					comment.replies = await getReplies(comment._id)
					comments.push(comment)
					if(i == (totalComments - 1))
					{
						return resolve(comments)
					}
				}
			}
			else
			{
				return resolve(comments)
			}
		})
	}
	catch (error) 
	{
		console.log(`In getComments main catch error: ${error.message}`)
	}
}

exports.getPostDetails = async (req,res) => {
	try
	{
		let { userID, postID } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let post = await Blog.findOne({_id:postID,isDeleted:false},{userID:1,type:1,categoryID:1,title:1,description:1,createdAt:1,blogNumber:1,commentsCount:1}).exec()
			if(post)
			{
				post = JSON.parse(JSON.stringify(post))
				post.userDetails = await AuthController.getUserDetails(post.userID)
				post.categoryName = await getCategoryName(post.categoryID)
				post.comments = await getComments(post._id)
				return res.status(200).json({
					status: 1,
					message: `Post details found`,
					post
				})
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Post not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.addComment = async (req,res) => {
	try
	{
		let { userID, postID, comment } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let post = await Blog.findOne({_id:postID},{ commentsCount:1 }).exec()
			if(post)
			{
				Comment.create(req.body).then(async comment => {
					await Blog.updateOne({_id:postID},{$inc:{commentsCount:1}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Comment added succesfully`
					})
				})
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Post not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.updateComment = async (req,res) => {
	try
	{
		let { userID, commentID, comment } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let commentDetails = await Comment.findOne({_id:commentID},{ userID:1 }).exec()
			if(commentDetails)
			{
				if(commentDetails.userID == userID)
				{
					await Comment.updateOne({_id:commentID},{$set:{comment:comment,updatedAt:new Date()}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Comment updated succesfully`,
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access! You cannot update comment added by others`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Comment not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.addReply = async (req,res) => {
	try
	{
		let { userID, postID, commentID, comment } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let post = await Blog.findOne({_id:postID},{ commentsCount:1 }).exec()
			if(post)
			{
				let comment = await Comment.findOne({_id:commentID},{ userID:1 }).exec()
				if(comment)
				{
					Reply.create(req.body).then(async reply => {
						return res.status(200).json({
							status: 1,
							message: `Reply added succesfully`
						})
					})
				}
				else
				{
					return res.status(404).json({
						status: 0,
						message: `Comment not found`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Post not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.updateReply = async (req,res) => {
	try
	{
		let { userID, replyID, comment } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let replyDetails = await Reply.findOne({_id:replyID},{ userID:1 }).exec()
			if(replyDetails)
			{
				if(replyDetails.userID == userID)
				{
					await Reply.updateOne({_id:replyID},{$set:{comment:comment,updatedAt:new Date()}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Reply updated succesfully`,
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access! You cannot update comment added by others`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Reply not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.addSubcomment = async (req,res) => {
	try
	{
		let { userID, postID, commentID, replyID, comment } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let post = await Blog.findOne({_id:postID},{ commentsCount:1 }).exec()
			if(post)
			{
				let comment = await Comment.findOne({_id:commentID},{ userID:1 }).exec()
				if(comment)
				{
					let reply = await Reply.findOne({_id:replyID},{ userID:1 }).exec()
					if(reply)
					{
						Subcomment.create(req.body).then(async subcomment => {
							return res.status(200).json({
								status: 1,
								message: `Subcomment added succesfully`
							})
						})
					}
					else
					{
						return res.status(404).json({
							status: 0,
							message: `Reply not found`
						})
					}
				}
				else
				{
					return res.status(404).json({
						status: 0,
						message: `Comment not found`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Post not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.updateSubcomment = async (req,res) => {
	try
	{
		let { userID, subcommentID, comment } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let subcommentIDDetails = await Subcomment.findOne({_id:subcommentID},{ userID:1 }).exec()
			if(subcommentIDDetails)
			{
				if(subcommentIDDetails.userID == userID)
				{
					await Subcomment.updateOne({_id:subcommentID},{$set:{comment:comment,updatedAt:new Date()}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Comment updated succesfully`,
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access! You cannot update comment added by others`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Reply not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.deletePost = async (req,res) => {
	try 
	{
		let { userID, postID } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let post = await Blog.findOne({_id:postID,isDeleted:false},{ userID:1 }).exec()
			if(post)
			{
				if(post.userID == userID)
				{
					await Blog.updateOne({_id:postID},{$set:{isDeleted:true}}).exec()
					await Comment.updateOne({postID:postID},{$set:{isDeleted:true}}).exec()
					await Reply.updateOne({postID:postID},{$set:{isDeleted:true}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Post deleted successfully`
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access!! You cannot delete post of other user`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Post not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.deleteComment = async (req,res) => {
	try 
	{
		let { userID, commentID } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let comment = await Comment.findOne({_id:commentID,isDeleted:false},{ postID:1, userID:1 }).exec()
			if(comment)
			{
				if(comment.userID == userID)
				{
					await Blog.updateOne({_id:comment.postID},{$inc:{commentsCount:-1}}).exec()
					await Comment.updateOne({_id:commentID},{$set:{isDeleted:true}}).exec()
					await Reply.updateOne({commentID:commentID},{$set:{isDeleted:true}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Comment deleted successfully`
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access!! You cannot delete comment of other user`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Comment not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

exports.deleteReply = async (req,res) => {
	try 
	{
		let { userID, replyID } = req.body
		let validUser = await isValidUser(userID)
		if(validUser)
		{
			let reply = await Reply.findOne({_id:replyID,isDeleted:false},{ userID:1 }).exec()
			if(reply)
			{
				if(reply.userID == userID)
				{
					await Reply.updateOne({_id:replyID},{$set:{isDeleted:true}}).exec()
					return res.status(200).json({
						status: 1,
						message: `Reply deleted successfully`
					})
				}
				else
				{
					return res.status(401).json({
						status: 0,
						message: `Unauthorized access!! You cannot delete comment of other user`
					})
				}
			}
			else
			{
				return res.status(404).json({
					status: 0,
					message: `Reply not found`
				})
			}
		}
		else
		{
			return res.status(404).json({
				status: 0,
				message: `User not found`
			})
		}
	}
	catch (error) 
	{
		console.log(`In main catch error: ${error.message}`)
		return res.status(500).json({
			status:0,
			message: `${error.message}`
		})
	}
}

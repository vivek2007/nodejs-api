const express = require('express')
const router = express.Router()
const controller = require('../../controllers/blog.controller')

router.get('/status', (req, res) => res.send('OK'))

router.route('/get-categories').get(controller.getCategories)
router.route('/create-post').post(controller.createPost)
router.route('/edit-post').post(controller.updatePost)
router.route('/get-posts').post(controller.getPosts)
router.route('/get-post-details').post(controller.getPostDetails)
router.route('/add-comment').post(controller.addComment)
router.route('/update-comment').post(controller.updateComment)
router.route('/add-reply').post(controller.addReply)
router.route('/update-reply').post(controller.updateReply)
router.route('/add-subcomment').post(controller.addSubcomment)
router.route('/update-subcomment').post(controller.updateSubcomment)
router.route('/delete-post').post(controller.deletePost)
router.route('/delete-comment').post(controller.deleteComment)
router.route('/delete-reply').post(controller.deleteReply)
router.route('/delete-subcomment').post(controller.deleteSubcomment)

module.exports = router

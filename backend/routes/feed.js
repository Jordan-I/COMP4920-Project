const express = require("express");
const router = express.Router();
const feeddb = require("../feedDB");

// @route POST /:course/feed/post
// @desc Add/reply to a post in the course topic feed.
// @body rootId, branchId, username, content, title
// @access private
router.post("/:course/feed/post", (req, res) => {
  const { rootId, branchId, username, content, title, sticky } = req.body;

  feeddb
    .addPost(
      username,
      req.params.course,
      content,
      rootId,
      branchId,
      title,
      sticky
    )
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

// delete post
// @route POST /:course/feed/:id/delete
// @desc Deletes a post in the course topic feed
// @access private
router.post("/:course/feed/:id/delete", (req, res) => {
  feeddb
    .deletePost(req.params.id)
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

// toggle upboat poast
// @route POST /:course/feed/:id/upvote
// @desc Attaches a like to a post. Clicking again removes the like.
// @body username
// @access private
router.post("/:course/feed/:id/upvote", (req, res) => {
  feeddb
    .upvotePost(req.params.id, req.body.username)
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

// check upvote state
// @route POST /:course/feed/:id/upvoteStatus
// @desc checks whether a post has been upvoted by the given user
// @body username
// @access private
router.post("/:course/feed/:id/upvoteStatus", (req, res) => {
  feeddb
    .upvoteStatus(req.params.id, req.body.username)
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

// get Course Feed
// @route GET /:course/feed
// @desc Retrieves the course feed for that particular course
// @access private
router.get("/:course/feed", (req, res) => {
  feeddb
    .getCourseFeed(req.params.course)
    .then(posts => {
      return res.status(200).json(posts);
    })
    .catch(err => {
      console.log(err.msg);
      return res.status(err.code).json(err);
    });
});

// get post and children
// @route GET /post/:postId
// @desc Retrieves the post with the given id and all that
// have it as their rootId
// @access private
router.get("/post/:postId", (req, res) => {
  feeddb
    .getPostAndChildren(req.params.postId)
    .then(posts => {
      return res.status(200).json(posts);
    })
    .catch(err => {
      console.log(err);
      return res.status(err.code).json(err);
    });
});

// edit post
// @route PUT /:course/feed/:id
// @desc Edit a post
// @body { post }
// @access private
router.put("/:course/feed/:id", (req, res) => {
  const { course, id } = req.params;
  const post = req.body.post;

  feeddb
    .editPost(id, post)
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

// getPost
// @route GET /:course/feed/:id
// @desc Retrieves a post based on id, useful for testing.
// @access private
router.get("/:course/feed/:id", (req, res) => {
  feeddb
    .getPost(req.params.id)
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

// toggle sticky post
// @route POST /:course/feed/id/sticky
// @desc Toggle Sticky a post
// @body { username }
// @access private
router.post("/:course/feed/:id/sticky", (req, res) => {
  const { course, id } = req.params;

  feeddb
    .toggleStickyPost(id, req.body.username)
    .then(reply => {
      return res.status(reply.code).json(reply);
    })
    .catch(err => {
      return res.status(err.code).json(err);
    });
});

module.exports = router;

import mongoose from "mongoose"
import { describe, expect, test, beforeEach } from "@jest/globals"

import {
  createPost,
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  getPostById,
  updatePost,
  deletePost,
} from "../services/posts.js"
import { Post } from "../db/models/post.js"

describe("Creating posts", () => {
  test("with all parameters should succeed", async () => {
    const post = {
      title: "Test Title",
      author: "Test Author",
      contents: "This is a test post with all fields filled in",
      tags: ["mongoose", "mongodb"],
    }
    const createdPost = await createPost(post)
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId)

    const foundPost = await Post.findById(createdPost._id)
    expect(foundPost).toEqual(expect.objectContaining(post))
    expect(foundPost.createdAt).toBeInstanceOf(Date)
    expect(foundPost.updatedAt).toBeInstanceOf(Date)
  })

  test("without title should fail", async () => {
    const post = {
      author: "Test Author",
      contents: "This is a test with no title",
      tags: ["empty"],
    }
    try {
      await createPost(post)
    } catch (err) {
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
      expect(err.message).toContain("`title` is required")
    }
  })

  test("with minimal parameters should succeed", async () => {
    const post = {
      title: "Only a title",
    }
    const createdPost = await createPost(post)
    expect(createdPost._id).toBeInstanceOf(mongoose.Types.ObjectId)
  })
})

const samplePosts = [
  { title: "Test 1", author: "Paul Setzer", tags: ["test1"] },
  { title: "Test 2", author: "Paul Setzer", tags: ["test2"] },
  { title: "Test 3", author: "Paul Setzer", tags: ["test3"] },
  { title: "Test 4" },
]

let createdSamplePosts = []

beforeEach(async () => {
  await Post.deleteMany({})
  createdSamplePosts = []
  for (const post of samplePosts) {
    const createdPost = new Post(post)
    createdSamplePosts.push(await createdPost.save())
  }
})

describe("Listing posts", () => {
  test("should return all posts", async () => {
    const posts = await listAllPosts()
    expect(posts.length).toEqual(createdSamplePosts.length)
  })

  test("should return posts sorted by creation date descending by default", async () => {
    const posts = await listAllPosts()
    const sortedSamplePosts = createdSamplePosts.sort(
      (a, b) => b.createdAt - a.createdAt,
    )
    expect(posts.map((post) => post.createdAt)).toEqual(
      sortedSamplePosts.map((post) => post.createdAt),
    )
  })

  test("should take into account provided sorting options", async () => {
    const posts = await listAllPosts({
      sortBy: "updatedAt",
      sortOrder: "ascending",
    })
    const sortedSamplePosts = createdSamplePosts.sort(
      (a, b) => a.updatedAt - b.updatedAt,
    )
    expect(posts.map((post) => post.updatedAt)).toEqual(
      sortedSamplePosts.map((post) => post.updatedAt),
    )
  })

  test("should be able to fliter posts by author", async () => {
    const posts = await listPostsByAuthor("Paul Setzer")
    expect(posts.length).toBe(3)
  })

  test("should be able to filter posts by tag", async () => {
    const posts = await listPostsByTag("test1")
    expect(posts.length).toBe(1)
  })
})

describe("Getting a post", () => {
  test("should return the full post", async () => {
    const post = await getPostById(createdSamplePosts[0]._id)
    expect(post.toObject()).toEqual(createdSamplePosts[0].toObject())
  })

  test("should fail if the ID does not exist", async () => {
    const post = await getPostById("000000000000000000000000")
    expect(post).toEqual(null)
  })
})

describe("Updating posts", () => {
  test("should update the specified property", async () => {
    await updatePost(createdSamplePosts[0]._id, {
      author: "Test Author",
    })
    const updatedPost = await Post.findById(createdSamplePosts[0]._id)
    expect(updatedPost.author).toEqual("Test Author")
  })

  test("should not update the other properties", async () => {
    await updatePost(createdSamplePosts[0]._id, {
      author: "Test Author",
    })
    const updatedPost = await Post.findById(createdSamplePosts[0]._id)
    expect(updatedPost.title).toEqual("Test 1")
  })

  test("should udate the updatedAt timestamp", async () => {
    await updatePost(createdSamplePosts[0]._id, {
      author: "Test Author",
    })
    const updatedPost = await Post.findById(createdSamplePosts[0]._id)
    expect(updatedPost.updatedAt.getTime()).toBeGreaterThan(
      createdSamplePosts[0].updatedAt.getTime(),
    )
  })

  test("should fail if the ID does not exist", async () => {
    const post = await updatePost("000000000000000000000000", {
      author: "Test Author",
    })
    expect(post).toEqual(null)
  })
})

describe("Deleting posts", () => {
  test("should remove the post from the database", async () => {
    const result = await deletePost(createdSamplePosts[0]._id)
    expect(result.deletedCount).toEqual(1)
    const deletedPost = await Post.findById(createdSamplePosts[0]._id)
    expect(deletedPost).toEqual(null)
  })

  test("should fail if the ID does not exist", async () => {
    const result = await deletePost("000000000000000000000000")
    expect(result.deletedCount).toEqual(0)
  })
})

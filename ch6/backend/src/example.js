import dotenv from "dotenv"
dotenv.config()

import { initDatabase } from "./db/init.js"
import { Post } from "./db/models/post.js"

await initDatabase()

const post = new Post({
  title: "Hello Mongoose!",
  author: "Paul Setzer",
  contents: "This is a blog post stored in a MongoDB database.",
  tags: ["mongoose", "mongodb"],
})

const createdPost = await post.save()

await Post.findByIdAndUpdate(createdPost._id, {
  $set: { title: "Hello again, Mongoose!" },
})

const posts = await Post.find()
console.log(posts)

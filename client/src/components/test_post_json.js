//example json for a post

export const posts = [
  {
    id: "post1",
    parent: "",
    children: ["comment1"],
    title: "My First Post",
    contentType: "text",
    body: "This is my first moo on Academoo, excited to chat and learn!",
    author: {
      id: "user1",
      host: "somewhere_else.edu",
    },
    // modified:
    // created:
  },
  {
    id: "post2",
    parent: "",
    children: [],
    title: "My Second Post",
    contentType: "text",
    body: "This is my second moo on Academoo, excited to chat and learn!",
    author: {
      id: "user1",
      host: "somewhere_else.edu",
    },
    // modified:
    // created:
  },
  {
    id: "comment1",
    parent: "post1",
    children: [],
    title: "A Comment",
    contentType: "text",
    body: "Here's a comment!",
    author: {
      id: "user2",
      host: "somewhere_else.edu",
    },
    // modified:
    // created:
  },
];

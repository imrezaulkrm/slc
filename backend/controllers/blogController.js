let blogs = []; // Temporary in-memory

exports.createBlog = (req, res) => {
  const { title, body, imageUrl } = req.body;
  const id = blogs.length + 1;
  const newBlog = { id, title, body, imageUrl };
  blogs.push(newBlog);
  res.json({ message: "Blog created", blog: newBlog });
};

exports.getAllBlogs = (req, res) => {
  res.json(blogs);
};

exports.getBlogById = (req, res) => {
  const blog = blogs.find(b => b.id == req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  res.json(blog);
};

exports.updateBlog = (req, res) => {
  const blog = blogs.find(b => b.id == req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  const { title, body, imageUrl } = req.body;
  blog.title = title || blog.title;
  blog.body = body || blog.body;
  blog.imageUrl = imageUrl || blog.imageUrl;

  res.json({ message: "Blog updated", blog });
};

exports.deleteBlog = (req, res) => {
  const index = blogs.findIndex(b => b.id == req.params.id);
  if (index === -1) return res.status(404).json({ message: "Blog not found" });
  const deleted = blogs.splice(index, 1);
  res.json({ message: "Blog deleted", blog: deleted[0] });
};

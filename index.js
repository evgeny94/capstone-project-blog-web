import express from "express";
import bodyParser from "body-parser";
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { formatDateTime, getItem, deletePost, checkAndUpdateChanges } from "./public/functions/functions.js";
import { Post } from './public/classes/post.js';
import methodOverride from 'method-override';

// Set up directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'public/uploads')); // Save to 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
}
});

const upload = multer({ storage: storage });


var posts = [
  {
    id: '1',
    title: 'Exploring Cooking Methods: Elevate Your Culinary Skills',
    author: 'ChatGPT',
    content: "Cooking is an art and a science, offering various methods to transform raw ingredients into delectable dishes. Each technique imparts unique flavors and textures, making your meals more enjoyable. Here, we explore some fundamental cooking methods that can elevate your culinary skills.",
    image: 'images/food.jpg',
    created: '14/06/2024 12:00:00',
    updated: null
  },
  {
    id: '2',
    title: 'The Power of Music: Connecting Minds and Hearts',
    author: 'ChatGPT',
    content: "Music, a universal language, has the incredible ability to connect people across cultures and generations. From the rhythmic beats of ancient drums to the complex compositions of modern symphonies, music transcends boundaries and speaks directly to our souls. Let's explore the profound impact of music on our lives and why it continues to be an essential part of human experience.",
    image: 'images/music.jpg',
    created: '14/06/2024 12:01:00',
    updated: null
  },
  {
    id: '3',
    title: 'The Thrill of Sports: Uniting Passion and Perseverance',
    author: 'ChatGPT',
    content: "Sports have a unique way of captivating our hearts and minds, offering a blend of excitement, discipline, and camaraderie. From the roar of the crowd at a soccer match to the quiet intensity of a chess game, sports transcend barriers and bring people together. Let's delve into the multifaceted world of sports and explore why they are an integral part of our lives.",
    image: 'images/sports.jpg',
    created: '14/06/2024 12:02:00',
    updated: null
  }
];

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware to parse URL-encoded bodies (form data) and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




app.get("/", (req, res) => {
  res.render("index.ejs", { posts });  
});

app.post('/submit', upload.single('post-image'), (req, res) => {

  // console.log('Form data:', req.body); // Log form data
  // console.log('File data:', req.file); // Log file data

  const { 'post-title': postTitle, 'post-author': postAuthor, 'post-content': postContent } = req.body;
  const postImage = req.file ? "uploads/" + req.file.filename : null;

  // Create a new post object
  const post = new Post(postTitle, postAuthor, postContent, postImage);
  posts.push(post);

  const postID = post.id;

  // Redirect back to the homepage (or any other page)
  res.redirect(`/view?elementId=${postID}`);
});

app.post('/submit-edit', upload.single('post-image'), (req, res) => {

  console.log('Form data:', req.body); // Log form data
  console.log('File data:', req.file); // Log file data
  const postID = req.body['post-id'];
  console.log(`need to submit edit of: ${postID}`);

  const { 'post-title': postTitleNew, 'post-author': postAuthorNew, 'post-content': postContentNew } = req.body;
  const postImageNew = req.file ? "uploads/" + req.file.filename : null;
  checkAndUpdateChanges(posts, postID, postTitleNew, postAuthorNew, postContentNew, postImageNew);
  res.redirect(`/view?elementId=${postID}`);
});

app.post('/log-click', (req, res) => {
  const { elementId } = req.body;
  console.log(`Element clicked: ${elementId}`);

  if (elementId.includes('_edit_btn')) {
    let parts = elementId.split('_');
    const subStrElementId = parts[0];
    res.json({ redirectUrl: `/submit-edit?elementId=${subStrElementId}` });
  }
  else if (elementId.includes('dlt_btn')) {
    console.log(`need to delete: ${elementId}`);
    let parts = elementId.split('_');
    const subStrElementId = parts[0];
    console.log(`subStrElementId: ${subStrElementId}`);
    posts = deletePost(posts, subStrElementId);
    res.json({ redirectUrl: `/` });
  }
  else if (elementId.includes('_edit')) {
    let parts = elementId.split('_');
    const subStrElementId = parts[0];
    res.json({ redirectUrl: `/edit?elementId=${subStrElementId}` });
  }
  else {
    res.json({ redirectUrl: `/view?elementId=${elementId}` });
  }
});

app.get("/view", (req, res) => {
  const { elementId } = req.query;
  const item = getItem(posts, elementId);
  res.render('view.ejs', { item });

});

app.get("/create", (req, res) => {
  res.render("create.ejs");
});

app.get("/list", (req, res) => {
  res.render("list.ejs", { posts });
});

app.get("/edit", (req, res) => {
  const { elementId } = req.query;
  const item = getItem(posts, elementId);
  res.render("edit.ejs", { item });
});


// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// fetch("https://jsonplaceholder.typicode.com/posts")
//   .then(response => response.json())
//   .then(data => {
//     console.log(data);
//   })
//   .catch(error => {
//     console.error("Error fetching data:", error);
//   });

async function fetchUserPostComments() {
  try {
    const postsResponse = await fetch(
      "https://jsonplaceholder.typicode.com/posts?userId=1"
    );
    const posts = await postsResponse.json();
    const firstPost = posts[0];

    console.log("First Post:", firstPost);
    const commentsResponse = await fetch(
      `https://jsonplaceholder.typicode.com/posts/${firstPost.id}/comments`
    );
    const comments = await commentsResponse.json();
    const filteredComments = comments.filter(comment =>
      comment.body.toLowerCase().includes("et")
    );

    console.log("Filtered Comments:", filteredComments);

    return filteredComments;
  } catch (error) {
    console.error("Error occurred:", error);
  }
}
fetchUserPostComments();

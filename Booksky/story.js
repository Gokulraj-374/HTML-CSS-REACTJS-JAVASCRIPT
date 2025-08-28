const popupOverlay = document.getElementById("popup-overlay");
const popupBox = document.getElementById("popup-box");
const addPopupButton = document.getElementById("add-popup-button");
const cancelPopup = document.getElementById("cancel-popup");
const storyForm = document.getElementById("story-form");
const storyList = document.getElementById("story-list");
const clearAllButton = document.getElementById("clear-all-button");
const downloadButton = document.getElementById("download-button");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const favoritesOnlyCheckbox = document.getElementById("favorites-only");

// Details modal elements
const detailsOverlay = document.getElementById("details-overlay");
const detailsBox = document.getElementById("details-box");
const detailsTitle = document.getElementById("details-title");
const detailsAuthor = document.getElementById("details-author");
const detailsDescription = document.getElementById("details-description");
const closeDetails = document.getElementById("close-details");

addPopupButton.addEventListener("click", () => {
  popupOverlay.style.display = "block";
  popupBox.classList.add("show");
});

cancelPopup.addEventListener("click", () => {
  popupOverlay.style.display = "none";
  popupBox.classList.remove("show");
});

storyForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("story-title-input").value;
  const author = document.getElementById("author-name-input").value || "Anonymous";
  const description = document.getElementById("description-input").value;

  const story = { 
    title, 
    author, 
    description, 
    date: new Date().toISOString(), 
    favorite: false
  };

  saveStory(story);
  renderStories();

  popupOverlay.style.display = "none";
  popupBox.classList.remove("show");
  storyForm.reset();
});

// Save story to localStorage
function saveStory(story) {
  let stories = JSON.parse(localStorage.getItem("stories")) || [];
  stories.push(story);
  localStorage.setItem("stories", JSON.stringify(stories));
}

// Delete story from localStorage
function deleteStory(storyToDelete) {
  let stories = JSON.parse(localStorage.getItem("stories")) || [];
  stories = stories.filter(
    s => !(s.title === storyToDelete.title && s.author === storyToDelete.author && s.description === storyToDelete.description)
  );
  localStorage.setItem("stories", JSON.stringify(stories));
}

// Toggle favorite status
function toggleFavorite(storyToUpdate) {
  let stories = JSON.parse(localStorage.getItem("stories")) || [];
  stories = stories.map(s => {
    if (
      s.title === storyToUpdate.title &&
      s.author === storyToUpdate.author &&
      s.description === storyToUpdate.description
    ) {
      s.favorite = !s.favorite;
    }
    return s;
  });
  localStorage.setItem("stories", JSON.stringify(stories));
  renderStories();
}

// Add story card to DOM
function addStoryToDOM(story) {
  const storyContainer = document.createElement("div");
  storyContainer.className = "story-container";

  const storyHTML = `
    <h2>${story.title}</h2>
    <h5>by ${story.author}</h5>
    <p>${story.description.substring(0, 120)}${story.description.length > 120 ? "..." : ""}</p>
    <button class="favorite-button">${story.favorite ? "❤️ Favorited" : "🤍 Favorite"}</button>
    <button class="delete-button">Delete</button>
    <button class="expand-button">Read More</button>
  `;
  storyContainer.innerHTML = storyHTML;
  storyList.appendChild(storyContainer);
  const deleteBtn = storyContainer.querySelector(".delete-button");
  deleteBtn.addEventListener("click", () => {
    storyList.removeChild(storyContainer);
    deleteStory(story);
  });
  const favBtn = storyContainer.querySelector(".favorite-button");
  favBtn.addEventListener("click", () => {
    toggleFavorite(story);
  });

  const expandBtn = storyContainer.querySelector(".expand-button");
  expandBtn.addEventListener("click", () => {
    detailsTitle.textContent = story.title;
    detailsAuthor.textContent = "by " + story.author;
    detailsDescription.textContent = story.description;

    detailsOverlay.style.display = "block";
    detailsBox.classList.add("show");
  });
}

closeDetails.addEventListener("click", () => {
  detailsOverlay.style.display = "none";
  detailsBox.classList.remove("show");
});

function renderStories() {
  let stories = JSON.parse(localStorage.getItem("stories")) || [];

  const sortBy = sortSelect.value;
  if (sortBy === "newest") {
    stories.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "oldest") {
    stories.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else if (sortBy === "author") {
    stories.sort((a, b) => a.author.localeCompare(b.author));
  }

  if (favoritesOnlyCheckbox.checked) {
    stories = stories.filter(s => s.favorite);
  }

  const query = searchInput.value.toLowerCase();
  stories = stories.filter(
    s => s.title.toLowerCase().includes(query) || s.author.toLowerCase().includes(query)
  );

  storyList.innerHTML = "";
  stories.forEach(story => addStoryToDOM(story));
}

sortSelect.addEventListener("change", renderStories);
favoritesOnlyCheckbox.addEventListener("change", renderStories);
searchInput.addEventListener("input", renderStories);

clearAllButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all stories?")) {
    localStorage.removeItem("stories");
    storyList.innerHTML = "";
  }
});

downloadButton.addEventListener("click", () => {
  let stories = JSON.parse(localStorage.getItem("stories")) || [];
  
  if (stories.length === 0) {
    alert("No stories to download!");
    return;
  }

  let content = "📖 My LifeSky Stories\n\n";
  stories.forEach((story, index) => {
    content += `Story ${index + 1}\n`;
    content += `Title: ${story.title}\n`;
    content += `Author: ${story.author}\n`;
    content += `Description: ${story.description}\n`;
    content += `Favorite: ${story.favorite ? "Yes" : "No"}\n`;
    content += `Date: ${new Date(story.date).toLocaleString()}\n`;
    content += `-----------------------------\n\n`;
  });

  const blob = new Blob([content], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "LifeSky_Stories.txt";
  link.click();
});

document.addEventListener("DOMContentLoaded", renderStories);

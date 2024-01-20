"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, ownStory = false) {
  const favorites = currentUser?.favorites || [];
  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
      <span class="icons">
      ${ownStory ? `<i class="fas fa-trash-alt itrash"></i>` : ""}
          <i class="${
            favorites.some((fav) => fav.storyId === story.storyId)
              ? "fas fa-star istar"
              : "far fa-star istar"
          }"></i>
      </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <div class="story-author">by ${story.author}</div>
        <div class="story-user">posted by ${story.username}</div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function putFavoritedStoriesOnPage() {
  const favorites = currentUser.favorites;

  $favoritedStoriesList.empty();

  if (favorites.length === 0) {
    const $alertNoFavs = $("<h5>").text("No favorites added!");
    $favoritedStoriesList.append($alertNoFavs);
  } else {
    favorites.forEach((favStory) => {
      const $favStory = generateStoryMarkup(favStory);
      $favoritedStoriesList.append($favStory);
    });
  }

  $favoritedStoriesList.show();
}

function putOwnStoriesOnPage() {
  const ownStories = currentUser.ownStories;

  $ownStoriesList.empty();

  if (ownStories === 0) {
    const alerNoOwnStories = $("<h5>").text("No stories added by user yet!");
    $ownStoriesList.append(alerNoOwnStories);
  } else {
    ownStories.forEach((ownStory) => {
      const $ownStory = generateStoryMarkup(ownStory, true);
      $ownStoriesList.append($ownStory);
    });
  }

  $ownStoriesList.show();
}

async function postStory(evt) {
  evt.preventDefault();
  const author = $("#author").val();
  const title = $("#title").val();
  const url = $("#url").val();

  await storyList.addStory(currentUser, { author, title, url });
  putStoriesOnPage();
  await clearStoryFormAndHide();
}

async function clearStoryFormAndHide() {
  $("#author").val("");
  $("#title").val("");
  $("#url").val("");

  $storyForm.hide(400);
}

$storyForm.on("submit", postStory);

$storiesContainer.on("click", ".icons>.itrash", async function () {
  const $trashIcon = $(this);
  const id = $trashIcon.closest("li").attr("id");
  await storyList.removeStory(currentUser, id);
  putOwnStoriesOnPage();
});

/**
 * Event handler for clicking on the star icon inside $allStoriesList.
 * Adds or removes the story from favorites based on the star icon state.
 * Toggles the star icon class between "far fa-star" and "fas fa-star".
 */

$storiesContainer.on("click", ".icons>.istar", async function () {
  const $starIcon = $(this);
  const id = $starIcon.closest("li").attr("id");

  if ($starIcon.hasClass("far fa-star")) {
    await User.addFavStory(currentUser, id);
  } else {
    await User.removeFavStory(currentUser, id);
  }

  $starIcon.toggleClass("far fa-star fas fa-star");
});
